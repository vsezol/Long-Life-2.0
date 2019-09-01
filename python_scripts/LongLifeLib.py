import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from math import *
from keras.models import Sequential
from keras.layers import *
from keras.layers.normalization import BatchNormalization
from keras.layers.advanced_activations import *
from keras.optimizers import SGD

class Preprocessor:
    def __init__(self, 
                 x_vars = [],
                 y_vars = [],
                 lstm = False,
                 alpha = 1,
                 lag_start = 24,
                 lag_end = 48,
                 normalization = True):    
        
        self.x_vars = x_vars
        self.y_vars = y_vars
        self.lstm = lstm
        self.alpha = alpha
        self.normalization = normalization
        self.lag_start = 24
        self.lag_end = 48
        
        self.period = self.lag_end - self.lag_start
        
        self.x_scaler = np.nan
        self.have_scaler = False
        self.have_params = False
        
    def exponential_smoothing(self, series, alpha):
        series = np.array(series)
        result = [series[0]] # first value is same as series
        for n in range(1, len(series)):
            result.append(alpha * series[n] + (1 - alpha) * result[n-1])
        return result
        
    def create_time(self, data):
        self.have_params = True
        dt = pd.to_datetime(data["Time"])
        data["Day"] = dt.dt.day
        data["Month"] = dt.dt.month
        return data
    
    def create_params(self, data):
        data = self.create_time(data)
        return data
    
    def fit(self, data):
        self.have_scaler = True
        self.x_scaler = StandardScaler()
        self.x_scaler.fit(data[:, :])
        
    def split_xy(self, data):
        X = self.create_x(data)
        Y = self.create_y(data)
        
        return X, Y

    def create_x(self, data):
        data = data.copy()
        for x in self.x_vars:
            #KOSTYIL
            if x == "Day" or x == "Month":
                continue
            data.loc[:, x] = self.exponential_smoothing(data.loc[:, x], self.alpha)
        data = self.create_params(data)
        
        data = data.loc[:, self.x_vars].values
    
        if not self.have_scaler:
            self.fit(data)
            
        if self.normalization:
            data = self.x_scaler.transform(data)
        
        if self.lstm:
            x = []
            for i in range(len(data)-self.lag_end-1):
                t = []
                for j in range(0, self.period):
                    t.append(data[[(i+j)], :])
                x.append(t)
            x = np.array(x)
            x = x.reshape(x.shape[0], self.period, len(self.x_vars))
        else:
            x = np.array(data)
    
        return x
    
    def create_y(self, data):
        data = data.copy()
        data = data.loc[:, self.y_vars].values
        
        if self.lstm:
            y=[]
            for i in range(len(data)-self.lag_end-1):
                y.append(data[i + self.lag_end, 0])
            y = np.array(y)
        else:
            y = np.array(data)
            y = y.reshape(len(y))

        return y
        
    def split_xy(self, data):
        x = self.create_x(data)
        y = self.create_y(data)
        
        return x, y
        
    def prepare_train_test(self, data):
        split_k = 0.06
        first_test = int(len(data) * (1-split_k))
        train = data[:first_test]
        test = data[first_test:]

        X_train, Y_train = self.split_xy(train)
        X_test, Y_test = self.split_xy(test)

        return X_train, Y_train, X_test, Y_test
        
        
class Model:
    def __init__(self):
        pass
    
    def fit(
        self,
        data,
        x_vars = [],
        y_vars = [],
        normalization = True,
        alpha = 1,
        nb_epoch = 10,
        lag_start = 24,
        lag_end = 48
    ):
        
        self.x_vars = x_vars
        self.y_vars = y_vars
        self.normalization = normalization
        self.alpha = alpha
        self.nb_epoch = nb_epoch
        self.lag_start = lag_start
        self.lag_end = lag_end
        
        self.preprocessor = Preprocessor(
            x_vars = self.x_vars,
            y_vars = self.y_vars,
            lstm = True,
            normalization = normalization,
            alpha = 0.1,
            lag_start = self.lag_start,
            lag_end = self.lag_end
        )

        x_train, y_train, x_test, y_test = self.preprocessor.prepare_train_test(data)
        
        self.model = Sequential()

        self.model.add(LSTM(128, return_sequences = False, recurrent_dropout = 0.5))
        self.model.add(BatchNormalization())
        self.model.add(LeakyReLU())
        self.model.add(Dropout(0.5))

        for i in range(2):
            self.model.add(Dense(128))
            self.model.add(BatchNormalization())
            self.model.add(LeakyReLU())
            self.model.add(Dropout(0.5))

        self.model.add(Dense(64))
        self.model.add(BatchNormalization())
        self.model.add(LeakyReLU())
        self.model.add(Dropout(0.5))

        self.model.add(Dense(1))
        self.model.add(BatchNormalization())
        self.model.add(Activation('linear'))

        opt = SGD(nesterov=True)
        self.model.compile(loss='mse', optimizer = opt, metrics = ["mae"])

        self.history = self.model.fit(x_train, np.array(y_train), nb_epoch = self.nb_epoch, validation_data = (x_test, y_test))

        self.x_test = x_test
        self.y_test = y_test
        
    def predict(self, data):
        x = self.preprocessor.create_x(data)
        y = self.model.predict(x)
        return y
        