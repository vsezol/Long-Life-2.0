import numpy as np
import pandas as pd
import pickle
from pymongo import MongoClient

# Ignore warnings
import warnings
warnings.filterwarnings("ignore")
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from LongLifeLib import *

#------------------
def get_recommendation(h2, co, h2o, t, its):
	s = ""

	if its <= 0.2:
		s = "Нормальное состояние, явные дефекты отсутсвуют"
	elif its <= 0.4:
		s = "Нормальное состояние с отклонениями, малозначительный дефект"
	elif its <= 0.6:
		s = "Нормальное состояние со значительными отклонениями, значительный дефект"
	elif its <= 0.8:
		s = "Ухудшенное состояние, критический дефект"
	else: 
		s = "Предаварийное предельное состояние"

	# if its <= 0.2:
	# 	s += "Техническое состояние трансформатора в норме, "
	# elif its <= 0.4:
	# 	s += "Трансформатор имеет слабо выраженные деффекты, нет особых рекомендаций, "
	# elif its <= 0.6:
	# 	s += "Трансформатор имеет деффекты способные повлиять на его работу, рекомендуем увеличить частоту анализа, "
	# elif its <= 0.8:
	# 	s += "Трансформатор повреждён, рекомендуем провести диагностику, "
	# else: 
	# 	s += "Трансформатор находится в критическом состоянии, рекомендуем немедленное отключение, "

	# s += "индекс технического состояния - " + str(round(its, 2)) + ". "

	# if (h2o < 0.2):
	# 	s += "Влагосодержание в норме. " 
	# elif (h2o < 0.4):
	# 	s += "Незначительное количество влажности. "
	# elif (h2o < 0.6):
	# 	s += "Резкий подъём влажности. "
	# elif (h2o < 0.8):
	# 	s += "Влажность близка к  критической. "
	# else:
	# 	s += "Критическая влажность. "

	# if (h2 < 0.2):
	# 	s += "Электрические разряды маловероятны. "
	# elif (h2 < 0.4):
	# 	s += "Редкие разряды. "
	# elif (h2 < 0.6):
	# 	s += "Зафиксированы электрические разряды, требуется устранение. "
	# elif (h2 < 0.8):
	# 	s += "Зафиксировано значительное кол-во электрических разрядов, требуется принятие мер. "
	# else:
	# 	s += "Требуется немедленное отключение трансформатора, критический уровень электрических разрядов. "

	# if (co < 0.2):
	# 	s += "Термические деффекты отсутствуют. "
	# elif (co < 0.4):
	# 	s += "Возможно нарушение твёрдой изоляции проводов"
	# 	if its > 0.45:
	# 		s += ', сопровождаемое перегрузка трансформатора'
	# 		if h2 > 0.5 and h2 < 0.75:
	# 			s += " и возможными искровыми разрядами"
	# 		elif h2 >= 0.75:
	# 			s += " и искровыми разрядами, вызывающими разложение масла и иные термические повреждения"
	# 	s += ". "
	# elif (co < 0.6):
	# 	s += "Зафиксировано незначительное нарушение твёрдой изоляции проводов"
	# 	if its > 0.55:
	# 		s += ', сопровождаемое повышенной перегрузкой трансформатора'
	# 		if h2 > 0.5 and h2 < 0.75:
	# 			s += " и вероятными искровыми разрядами"
	# 		elif h2 >= 0.75:
	# 			s += " и вероятными дуговыми разрядами, вызывающими разложение масла и иные термические повреждения"
	# 	s += ". "
	# elif (co < 0.8):
	# 	s += "Зафиксировано значительное нарушение твёрдой изоляции проводов"
	# 	if its > 0.7:
	# 		s += ', сопровождаемое сильной перегрузкой трансформатора'
	# 		if h2 > 0.5 and h2 < 0.75:
	# 			s += " и вероятными дуговыми разрядами"
	# 		elif h2 >= 0.75:
	# 			s += " и дуговыми разрядами, вызывающими разложение масла и иные термические повреждения"
	# 	s += ". "
	# else:
	# 	s += "Требуется немедленное отключение трансформатора, зафиксированы процессы горения"
	# 	if its > 0.7:
	# 		s += ', сопровождаемое сильной перегрузкой трансформатора'
	# 		if h2 > 0.6 and h2 < 0.75:
	# 			s += " и дуговыми разрядами"
	# 		elif h2 >= 0.75:
	# 			s += " и сильными дуговыми разрядами, вызывающими разложение масла и иные термические повреждения"
	# 	s += ". "

	# if (t < 0.2):
	# 	s += "Тепловой нагрев незначителен. "
	# elif (t < 0.4):
	# 	s += "Наблюдается тепловой нагрев. "
	# elif (t < 0.6):
	# 	s += "Трансформатор требует охлаждения, усиленный нагрев. "
	# elif (t < 0.8):
	# 	s += "Тепловая перегрузка, требуется отключение. "
	# else:
	# 	s += "Критический нагрев, необходимо отключение. "

	# s += "Тепловой индекс - " + str(round(t, 2)) + ". "
	# s += "Индекс концентрации газов - " + str(round(((h2 + co) / 2), 2)) + ". "
	# s += "Индекс влажности - " + str(round(h2o, 2)) + "."

	return s
#------------------


def index_calculation(fact, lifetime):
    """
    0 - H2
    1 - CO
    2 - Humidity
    3 - Temp
    """
    num_params = 4
    
    ideal = [0, 0, 0, 38]
    critic = [100, 700, 20, 70]
    
    lifetime_ideal = 25
    lifetime_critic = 50
    
    index = [0, 0, 0, 0, 0] #last param - ITS
    
    beta = [0.2, 0.2, 0.2]
    if lifetime > 25:
        index[-1] += 0.4*((lifetime_ideal - lifetime)/(lifetime_ideal - lifetime_critic))**2

        
    for i in range(num_params):
        index[i] = abs((ideal[i] - fact[i])/(ideal[i] - critic[i]))
        if not i == 3:
            index[-1] += beta[i] * (index[i]**2)
        
    return index

def load_model(name):
	file = open("python_scripts\\MODELS\\" + name, "rb")
	# file = open("MODELS\\" + name, "rb")
	model = pickle.load(file)
	file.close()
	return model

def transform(data):
	res = []
	for i in range(len(data)):
		res.append([i, data[i]])
	return res

while(True):
	# print("Start py")

	path = ""
	id = ""

	try:
		path = input()
		id = input()
	except EOFError:
		continue

	# if path == "" or id == "":
	# 	continue

	# path = "data.xlsx"
	# id = "1"

	data1 = pd.read_excel(path)

	y_vars = ["Humidity", "Upper_oil_temp", "H2_concentration", "CO_concentration"]

	prediction = pd.DataFrame()
	for y_var in y_vars:
		data = data1.copy()

		print(y_var + " loaded")
		model = load_model(y_var)
		print("Model loaded")

		pred = model.predict(data)
		print("Predicted")
		print("Len", str(len(pred)))
		prediction.loc[:, y_var] = pred.reshape(len(pred)) 	

	prediction.loc[:, "Index"] = prediction.index

	prediction = prediction.loc[(len(prediction)-min(24, len(prediction))):, :]

	lo = prediction.iloc[-1, :] #Last Observation
	index = index_calculation([lo["H2_concentration"], lo["CO_concentration"], lo["Humidity"], lo["Upper_oil_temp"]], 0)
	recommendation = get_recommendation(index[0], index[1], index[2], index[3], index[4])

	#Upload data
	client = MongoClient()
	db = client["usersdb"]
	collection = db["Prediction"]

	"""
	0 - H2
    1 - CO
    2 - Humidity
    3 - Temp
	4 - ITS
    """

	Humidity = transform(list(prediction.loc[:, "Humidity"]))
	Oil_temp = transform(list(prediction.loc[:, "Upper_oil_temp"]))
	H2_concentration = transform(list(prediction.loc[:, "H2_concentration"]))
	CO_concentration = transform(list(prediction.loc[:, "CO_concentration"]))

	post = {
		"id": id,
		"Request_type": "Virtual_sensor",
		"Humidity": Humidity,
		"Oil_temp": Oil_temp,
		"H2_concentration": H2_concentration,
		"CO_concentration": CO_concentration,
		"index" : index,
		"recommendation": recommendation 
	}

	# print("Humidity\n", Humidity)
	# print("Oil_temp\n", Oil_temp)
	# print("H2_concentration\n", H2_concentration)
	# print("CO_concentration\n", CO_concentration)
	# print("index\n", index)

	collection.insert_one(post)
	client.close()

	print("end py")