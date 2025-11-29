import requests
import time
import json



def apagar(ip,puerto):
    url = 'http://172.20.208.'+ip
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port["+puerto+"]/iolinkdevice/pdout/setdata", "data": {"newvalue": "00"}}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()
    
def rfid():
    url = 'http://172.20.208.50'
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[5]/iolinkdevice/pdin/getdata"}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()
    dato=Rjson1["data"]["value"]
    print(dato)

while(True):
    mensaje = input("")

    if mensaje == "fresa_e":
        time.sleep(8)
        apagar('51','1')
    elif mensaje == "fresa_r":
        time.sleep(8)
        apagar('51','2')
    elif mensaje == "torno_e":
    
        time.sleep(8)
        apagar('52','1')
    elif mensaje == "torno_r":
        
        time.sleep(8)
        apagar('52','4')
    elif mensaje == "principal_e":
       
        time.sleep(8)
        apagar('50','3')
    elif mensaje == "principal_r":
        time.sleep(8)
        apagar('50','4')
        rfid()
    elif mensaje == "salir":
        break