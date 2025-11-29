import requests

"""""
url = 'http://172.20.208.239'
datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[1]/iolinkdevice/pdout/setdata", "data": {"newvalue": "01"}}
respuesta2 = requests.post(url, json = datos1)
Rjson1 = respuesta2.json()
"""
url = 'http://172.20.208.50'
datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[2]/iolinkdevice/pdin/getdata"}
respuesta = requests.post(url, json = datos1)
Rjson1 = respuesta.json()
dato=Rjson1["data"]["value"]
print(dato)