import requests
import time
import json

def encender(ip, puerto):
    
    url = 'http://172.20.208.'+ip
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port["+puerto+"]/iolinkdevice/pdout/setdata", "data": {"newvalue": "01"}}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()
    print ("Prendido")


    


while(True):
    mensaje = input("")

    if mensaje == "fresa_e":
        encender('51','1')
        
        
    elif mensaje == "fresa_r":
        encender('51','2')
       
        
    elif mensaje == "torno_e":
        encender('52','1')
        
        
    elif mensaje == "torno_r":
        encender('52','4')
        
        
    elif mensaje == "principal_e":
        encender('50','3')
        
        
    elif mensaje == "principal_r":
        encender('50','4')
        
    elif mensaje == "salir":
        break
    
    