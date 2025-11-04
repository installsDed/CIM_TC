import socket
import time

tcp_client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_client_socket.connect(("172.20.208.105", 8001))
time.sleep(2)


mensaje=input("")
dato="R_"+mensaje
tcp_client_socket.send(dato.encode())
time.sleep(1)
#tcp_client_socket.send("2".encode())
#time.sleep(1)
#tcp_client_socket.send("3".encode()) 
time.sleep(2)      
tcp_client_socket.close()    