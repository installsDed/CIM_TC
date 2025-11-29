import requests
import time
import json
import socket

datos=["0004E004015314A540A600000000000000000000000000000000000000000000",
        "0004E004015314A5457C00000000000000000000000000000000000000000000",
        "0004E004015314A5444300000000000000000000000000000000000000000000",
        "0004E004015314A5444500000000000000000000000000000000000000000000",
        "0004E004015314A5457900000000000000000000000000000000000000000000",
        "0004E004015314A53F7000000000000000000000000000000000000000000000"]
condicion=False

tcp_client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_client_socket.connect(("172.20.208.151", 50010))
tcp_client_socket.send(
    "1234L000000008\r\n1234T?\r\n".encode())
time.sleep(0.5)
tcp_client_socket.send(
    "1234L000000008\r\n1234R?\r\n".encode())
time.sleep(0.3)
udp_data = tcp_client_socket.recv(1024)
a = udp_data.decode()
b = a[30:34]


url = 'http://172.20.208.52'
datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[2]/iolinkdevice/pdin/getdata"}
respuesta = requests.post(url, json = datos1)
Rjson1 = respuesta.json()
dato=Rjson1["data"]["value"]
for num in datos:
    if num==dato:
        condicion=True

if(condicion and b!='stop'):
    url = 'http://172.20.208.53'
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[2]/iolinkdevice/pdout/setdata", "data": {"newvalue": "00"}}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()

    url = 'http://172.20.208.53'
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[1]/iolinkdevice/pdout/setdata", "data": {"newvalue": "01"}}
    respuesta2 = requests.post(url, json = datos1)
    Rjson1 = respuesta2.json()
    print('funciono')

else:
    url = 'http://172.20.208.53'
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[2]/iolinkdevice/pdout/setdata", "data": {"newvalue": "00"}}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()

    url = 'http://172.20.208.53'
    datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[3]/iolinkdevice/pdout/setdata", "data": {"newvalue": "01"}}
    respuesta = requests.post(url, json = datos1)
    Rjson1 = respuesta.json()
    print("error")