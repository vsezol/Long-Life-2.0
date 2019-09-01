import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from math import *
from keras.models import Sequential
from keras.layers import *
from keras.layers.normalization import BatchNormalization
from keras.layers.advanced_activations import *
from keras.optimizers import SGD

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
        