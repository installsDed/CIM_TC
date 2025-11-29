import requests
import time
import json
import socket

#Recibe dato de verificación
verificacion=input("")
datosT=["0004E004015314A540A600000000000000000000000000000000000000000000",
        "0004E004015314A5457C00000000000000000000000000000000000000000000",
        "0004E004015314A5444300000000000000000000000000000000000000000000",
        "0004E004015314A5444500000000000000000000000000000000000000000000",
        "0004E004015314A5457900000000000000000000000000000000000000000000",
        "0004E004015314A53F7000000000000000000000000000000000000000000000"
       ]
datosF=["0004E004015314A5457800000000000000000000000000000000000000000000",
        "0004E004015314A5457700000000000000000000000000000000000000000000",
        "0004E004015314A5444400000000000000000000000000000000000000000000",
        "0004E004015314A5457D00000000000000000000000000000000000000000000",
        "0004E004015314A5457A00000000000000000000000000000000000000000000",
        "0004E004015314A5444600000000000000000000000000000000000000000000"
        ]
condicion=False

tcp_client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_client_socket.connect(("172.20.208.149", 50010))
tcp_client_socket.send(
    "1234L000000008\r\n1234T?\r\n".encode())
time.sleep(0.5)
tcp_client_socket.send(
    "1234L000000008\r\n1234R?\r\n".encode())
time.sleep(0.3)
udp_data = tcp_client_socket.recv(1024)
a = udp_data.decode()
b = a[30:34]    #arroja la foto 1 o 2


url = 'http://172.20.208.50'
datos1 = {"code": "request", "cid": 4, "adr": "/iolinkmaster/port[5]/iolinkdevice/pdin/getdata"}
respuesta = requests.post(url, json = datos1)
Rjson1 = respuesta.json()
dato=Rjson1["data"]["value"]

time.sleep(1)
if b == 1:
    foto="torno"
elif b == 2:
    foto="fresa"
else:
    foto="error1"

if verificacion == "torno": 
    if foto == "torno":
        error=False
        errorF=False
    elif foto == "error1":
        error=False
        errorF=True
    else:
        error=True
        errorF=False   
    for num in datosT:
        if num==dato:
            condicion=True
elif verificacion == "fresa":
    if foto == "fresa":
        error=False
        errorF=False
    elif foto == "error1":
        error=False
        errorF=True
    else:
        error=True
        errorF=False

    for num in datosF:
        if num == dato:
            condicion=True

if error:
    print("error0")
elif errorF:
    print("error1")
else:
    if(condicion):   
        print('funciono')
    
    else:
        print("error")