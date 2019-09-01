import pandas as pd
data = pd.read_csv("upload.csv")
data.to_excel("future.xlsx")