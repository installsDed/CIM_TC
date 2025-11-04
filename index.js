import express from 'express';
import http from 'http';
import path from 'path';
import {PythonShell} from "python-shell";
import {promises as fs2} from 'fs';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { Server } from "socket.io"
import mqtt from 'mqtt';
import bcryptjs from 'bcryptjs';
import session from 'express-session';
import mysql from 'mysql';
//import { setTimeout } from 'timers';
//import { setInterval } from 'timers';
var e1=false
var e2=false
var eF=false
var tarea1,tareaI, lista_filtrada, client, mesaV, fresadora,torn,columna,fila,foto,RFID,aprueba,columnaE,filaE,puertoIN

var datos=new Array()
var datos1=new Array()
var datos2=new Array()
var datos3 = new Array()
var datos4 = new Array()
var datos5 = new Array()
var estados=new Array()
var estados1=new Array()
var estados2=new Array()
var lista_filtrada
var verificacion=true
const app = express();
app.use(session({
    secret: 'secret',
    resave:true,
    saveUninitialized:true
}));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = "172.20.208.15";
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")))

var ip = "http://172.20.208.15:3000/"
const puerto = 3000


const conexion = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'estados'
})

conexion.connect((error) => {
    if(error){
        console.log(error);
    }
    console.log("SQL");

});

io.on('connection', (socket)=>{
        socket.on("inicio", (msg)=>{
            tareaI = msg;
        });
        socket.on("slot", (msg)=>{
            tarea1 = msg;
        });
        socket.on("inicio", (msg)=>{
            mesaV = msg; 
        });
})
app.get('/index',(req,res)=>{
    
    
    async function sendData() {
    try {
        const response = await fetch('http://172.20.208.75:80', {
            method: 'POST',
            body: JSON.stringify({
                code: "request",
                cid: 4,
                adr: "/iolinkmaster/port[6]/iolinkdevice/pdout/setdata",
                data: { newvalue: "01" }
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta recibida:", data);
    } catch (e) {
        console.error("Error al conectar con el master");
    }
}

sendData();
/*
    try{
            const response2 = fetch('http://172.20.208.76:80',{
                method: 'post',
                body: JSON.stringify({"code": "request", "cid": 4, "adr": "/iolinkmaster/port[2]/iolinkdevice/pdout/setdata", "data": {"newvalue": "01"}}),
                headers: {'Content-Type': 'application/json'}
            }); 
        }catch(e){
            console.error(e)
            console.log("Error al conectar con el master")
        }
            */
        //--------------------------prender balizas en amarillo comentadas por pruebas---------------
    lista_filtrada=null
    conexion.query('SELECT estado FROM maquinas',(error, results)=>{
        try{
            if(results[0].estado==1){
                e1=true
            }else if(results[0].estado==0){
                e1=false
            }
            if(results[1].estado==1){
                e2=true
            }else if(results[1].estado==0){
                e2=false
            }
            if(e1||e2){
                eF=true
            }else{
                eF=false
            }
            console.log("e1: "+e1+" e2: "+e2+" eF: "+eF)
            res.render('index',{state1:e1,state2:e2,final:eF})
        }catch(error){
            console.log("error: "+error)
        }
    })
    
   
})
app.post('/verificacion', async (req,res)=>{
    if(e1&&e2){
        console.log("e1: "+e1+" e2: "+e2+" eF: "+eF)
        res.render('index', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Ya estan ocupadas todas las maquinas",
            alertIcon: "error",
            timer: 2500,
            ruta: "index",
            ip: ip,
            state1:e1,
            state2:e2,
            final:eF
            ,ver:verificacion
        })
        
    }else{
        console.log("e1: "+e1+" e2: "+e2+" eF: "+eF)
        res.redirect('/recoleccion')
    }
})



app.post('/tabla',async(req,res)=>{
    conexion.query('SELECT A1_C1,A1_C2,A1_C3, A2_C1, A2_C2, A2_C3 FROM almacen',(error,results)=>{
        var result = Object.values(JSON.parse(JSON.stringify(results)))
       for(let i=0; i<result.length;i++){
            datos[i]=result[i].A1_C1
            datos1[i]=result[i].A1_C2
            datos2[i]=result[i].A1_C3
            datos3[i]=result[i].A2_C1
            datos4[i]=result[i].A2_C2
            datos5[i]=result[i].A2_C3
       }
    })
    conexion.query('SELECT A2_C1, A2_C2, A2_C3 FROM final',(error,results)=>{
        var result = Object.values(JSON.parse(JSON.stringify(results)))
       for(let i=0; i<result.length;i++){
            if(result[i].A2_C1==0){
                estados[i]="Rechazado"
            }else if(result[i].A2_C1==1){
                estados[i]="Aceptado"
            }else if(result[i].A2_C1==2){
                estados[i]="Indefinido"
            }
            if(result[i].A2_C2==0){
                estados1[i]="Rechazado"
            }else if(result[i].A2_C2==1){
                estados1[i]="Aceptado"
            }else if(result[i].A2_C2==2){
                estados1[i]="Indefinido"
            }
            if(result[i].A2_C3==0){
                estados2[i]="Rechazado"
            }else if(result[i].A2_C3==1){
                estados2[i]="Aceptado"
            }else if(result[i].A2_C3==2){
                estados2[i]="Indefinido"
            }
       }

    })
    res.redirect('/estados')
})
app.get('/estados',(req,res)=>{

    res.render('tabla', {es:datos,es1:datos1,es2:datos2,es3:datos3,es4:datos4,es5:datos5,vr:estados,vr1:estados1,vr2:estados2})
})
app.get('/recoleccion',(req,res)=>{

    

    res.render('paso1')
})
app.get('/proceso', (req,res)=>{
    
    let lista_ruta = [tareaI,tarea1]
    lista_filtrada =lista_ruta.filter(element => element !=0&&element!=undefined)
    console.log(lista_ruta)
    console.log(lista_filtrada[0],lista_filtrada[1])
    

    if(lista_filtrada.length>0){
        if(lista_filtrada[1]==1||lista_filtrada[1]==4){
            columna='A1_C1'
        }else if(lista_filtrada[1]==2||lista_filtrada[1]==5){
            columna='A1_C2'
        }else if(lista_filtrada[1]==3||lista_filtrada[1]==6){
            columna='A1_C3'
        }
        if(lista_filtrada[0]=='fresa'&&e1==false){
            puertoIN='2'
            if(lista_filtrada[1]<4){
                fila=1
            }else if(lista_filtrada[1]>=4){
                fila=2
            }
           console.log(columna+'_F'+fila) 
            try{
                conexion.query('SELECT '+columna+' FROM almacen WHERE FILA='+fila+'',(error,results)=>{
                    if(results[0][columna]>0){
                        //fresa
                        res.render('paso2')
                    }else{
                        res.render('index', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El slot no está disponibles",
                            alertIcon: "error",
                            timer: 4500,
                            ruta: "index",
                            ip: ip,
                            state1:e1,
                            state2:e2,
                            final:eF
                            ,ver:verificacion   
                        }) 
                    }
                    
                })
                
            }catch(error){
                console.log(error)
            }
           
            
        }else if(lista_filtrada[0]=='torno'&&e2==false){
            puertoIN='6'
            if(lista_filtrada[1]<4){
                fila=3
            }else if(lista_filtrada[1]>=4){
                fila=4
            }
            try{
                conexion.query('SELECT '+columna+' FROM almacen WHERE FILA='+fila+'',(error,results)=>{
                   if(results[0][columna]>0){
                        //torno
                        res.render('paso2')               
                    }else{
                        res.render('index', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "El slot no está disponibles",
                            alertIcon: "error",
                            timer: 4500,
                            ruta: "index",
                            ip: ip,
                            state1:e1,
                            state2:e2,
                            final:eF
                            ,ver:verificacion   
                        }) 
                    } 
                })
                
            }catch(error){
                console.log(error)
            }
            
        }else{
            res.render('index', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "La maquina seleccionada no esta disponible",
                alertIcon: "error",
                timer: 4500,
                ruta: "index",
                ip: ip,
                state1:e1,
                state2:e2,
                final:eF
                ,ver:verificacion   
            })    
        }
    }else{
        res.render('index', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error en la elección",
            alertIcon: "error",
            timer: 2500,
            ruta: "index",
            ip: ip,
            state1:e1,
            state2:e2,
            final:eF
             
        })
    }
    

})

app.get('/proceso/mensajes',(req,res)=>{
    client = mqtt.connect('ws://172.20.208.17:8083/mqtt')
        var con=0
        var rechazado=0
        try{
                var contador=0
                
                function conectar(){
                    client.subscribe('1/autonomo_r')
                    client.subscribe('fresa')
                    client.subscribe('torno')
                }
                //client.publish('1/autonomo',columna+'_F'+fila)
                //mensaje a robot de donde va tomar materia prima---------
                var pyR =new PythonShell('robot.py')
                pyR.send(columna+'_F'+fila)
                console.log(columna+'_F'+fila)
                pyR.on('message',function(message){
                    pyR.end()
                })
                client.publish('1/autonomo','almacen_r')
                function mensaje(topic,message){
                    if(topic==lista_filtrada[0]){
                        const data=JSON.parse(message)
                        
                        const dataValue = data.data.payload["/iolinkmaster/port["+puertoIN+"]/iolinkdevice/pdin"].data
                        if (dataValue !== undefined) {
                        //console.log(dataValue); // Debería mostrar "3217"
                        } else {
                        console.log("No se encontró el valor de 'data'");
                        }
                        if(dataValue!='7FE0'&&con==0){
                            con=1 //enclave 
                            //console.log('if')
                            var py_F = new PythonShell(lista_filtrada[0]+'.py')
                           
                            py_F.on('message',function(message){
                                console.log('py')
                                if(message=='error'){
                                    rechazado=1
                                    var pM = new PythonShell('motores.py')
                                    pM.send(lista_filtrada[0]+'_e')
                                    pM.on('message',function(message){
                                        client.publish('1/autonomo',message)
                                        pM.end()
                                        var pyMA = new PythonShell('motoresA.py')
                                        pyMA.send(lista_filtrada[0]+'_e')
                                        pyMA.on('message',function(message){
                                            
                                            pyMA.end()
                                        })
                                    })
                                    py_F.end()
                                }else{
                                    //correcto
                                    //mensaje a base que la maquina se ocupo

                                    client.publish('1/autonomo','aceptado')
                                    py_F.end()
                                }
                            })
                        }else if(dataValue=='7FE0'&&con==1){
                            con=0
                            var apagar = new PythonShell('apagado.py')
                            apagar.send(lista_filtrada[0])
                            apagar.on('message',function(message){
                                apagar.end()
                            })
                        }
                    }
                    
                    //console.log(message.toString())
                    if(message=='listo'){
                        if(contador==0){
                            contador++
                            client.publish('1/autonomo',lista_filtrada[0]+'_e')
                        }else if(contador==1){
                            //motores mesa
                            var pyM= new PythonShell('motores.py')
                            pyM.send(lista_filtrada[0]+'_r')
                            pyM.on('message',function(message){
                                client.publish('1/autonomo',message)
                                pyM.end()
                                var pyMA = new PythonShell('motoresA.py')
                                pyMA.send(lista_filtrada[0]+'_r')
                                pyMA.on('message',function(message){
                                    pyMA.end()
                                })
                            })
                            contador++
                        }else if(contador==2&&rechazado==1){
                            client.publish('1/autonomo','almacen_e')
                            contador++
                        }else if(contador==2){
                            //se quedo en mesa
                            try{
                                conexion.query('UPDATE maquinas set estado=? WHERE estacion=?',[1,lista_filtrada[0]], async(error, results)=> {
                                    res.redirect('/index')
                                    client.end() 
                                    if (error) {
                                        console.log(error);
                                    }
                                });
                                
                            }catch(error){
                                console.log(error)
                            }
                        }else if(contador==3){
                            if(rechazado==1){
                                rechazado=0
                                var pyR =new PythonShell('robot2.py')
                                pyR.send(columna+'_F'+fila)
                                pyR.on('message',function(message){
                                    pyR.end()
                                    try{
                                        conexion.query('UPDATE maquinas set estado=? WHERE estacion=?',[0,lista_filtrada[0]], async(error, results)=> {
                                             
                                            if (error) {
                                                console.log(error);
                                            }
                                        });
                                        
                                    }catch(error){
                                        console.log(error)
                                    }
                                    
                                })
                                //lo regreso a almacen
                            }
                            console.log("almacen tomo")
                            res.redirect('/index')
                            client.end()
                        }                        
                        
                    }
                }

                client.on('connect', conectar)
                client.on('message', mensaje)
                
            
            
        }catch(error){
            console.log(error)
        }
    
})
app.post('/calidad',async(req,res)=>{
    conexion.query('SELECT estacion, estado, recoleccion FROM maquinas',(error, results)=>{
        if(results[2].estado==0){
                if(results[0].estado==1){
                    fresadora=true
                }else if(results[0]==0){
                    fresadora=false
                }
                if(results[1].estado==1){
                    torn=true
                }else if(results[1]==0){
                    torn=false
                }
                res.redirect('/mesa') 
                                        //verifica las mesas a las que puede ir a recoger
        }else{
            res.render('index', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Mesa de verificación ocupada",
                alertIcon: "error",
                timer: 2500,
                ruta: "index",
                ip: ip,
                state1:e1,
                state2:e2,
                final:eF
                 
            })
        }
    })
    
})
app.get('/carga',(req,res)=>{
    res.render('carga')
})
app.get('/mesa',(req,res)=>{
                                       
    
    res.render('paso4',{fresa:fresadora,torno:torn})
})
app.get('/proceso-v',(req,res)=>{
    let lista_ruta = [mesaV]
    lista_filtrada =lista_ruta.filter(element => element !=0&&element!=undefined)
    console.log(lista_ruta)
    console.log(lista_filtrada[0])
    if(lista_filtrada.length>0){
        res.render('paso5')
    }else{
        res.render('index', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error en la elección",
            alertIcon: "error",
            timer: 2500,
            ruta: "index",
            ip: ip,
            state1:e1,
            state2:e2,
            final:eF 
        })
    }

})
app.get('/proceso/verificacion',(req,res)=>{
    //funcion para recolectar y verificar
    client = mqtt.connect('ws://172.20.208.17:8083/mqtt')
    var contador=0 
    var con=0
    var ver=0 
    var imagen2_R
    var imagen1_R   
    function conectar(){
        client.subscribe('1/autonomo_r')
        client.subscribe('m_principal')
        client.subscribe('fresa')
        client.subscribe('torno')
    }
    client.publish('1/autonomo',lista_filtrada[0]+'_r')    //primer mensaje
    function mensaje(topic,message){            
        //console.log(message.toString())
        
        if(topic=='m_principal'){
            
            const data=JSON.parse(message)
            const dataValue = data.data.payload["/iolinkmaster/port[5]/iolinkdevice/pdin"].data
            if(dataValue!='7FE0'&&con==0){
                con=1
                const cam_1 = 'C:/Users/ITLinares/Documents/CIM_TC/public/172.20.208.50'
                fs2.readdir(cam_1)
                    .then(files => {
                        const unlinkPromises = files.map(file => {
                            const filePath = path.join(cam_1, file)
                            return fs2.unlink(filePath)
                        })
                        return Promise.all(unlinkPromises)
                    }).catch(err => {
                    console.error(`Something wrong happened removing files of ${cam_1}`)
                });
                var pyF = new PythonShell('verificacion.py')
                pyF.on('message',function(message){
                    if(message=='error'){
                        //rechazado
                        try{
                            conexion.query('UPDATE calidad set rechazados=rechazados+1 WHERE 1', async(error, results)=> {
                                if (error) {
                                    console.log(error);
                                }
                            });
                            imagen2_R = "Rechazado";
                            var filePath = "C:/Users/ITLinares/Documents/CIM_TC/public/aprueba.txt";
                            fs.writeFile(filePath, imagen2_R, (err)=>{
                                if (err) throw  err;
                                console.log("Nombre: "+imagen2_R)
                            })
                        }catch(error){
                            console.log(error)
                        }
                    }else{
                        //aprobado --- mesa verificacion
                        try{
                            conexion.query('UPDATE calidad set aceptados=aceptados+1 WHERE 1', async(error, results)=> {
                                if (error) {
                                    console.log(error);
                                }
                            });
                             imagen2_R = "Aprobado";
                            var filePath = "C:/Users/ITLinares/Documents/CIM_TC/public/aprueba.txt";
                            fs.writeFile(filePath, imagen2_R, (err)=>{
                                if (err) throw  err;
                                console.log("Nombre: "+imagen2_R)
                            })
                        }catch(error){
                            console.log(error)
                        }
                    }
                    setTimeout(() => {
                        let files1 = fs.readdirSync("C:/Users/ITLinares/Documents/CIM_TC/public/172.20.208.50")
                        let jpg1 = files1[0];
                        let img = encodeURIComponent(jpg1)
                        let img2  = decodeURIComponent(img)
                        imagen2_R = "172.20.208.50/" + img2;
                        var filePath = "C:/Users/ITLinares/Documents/CIM_TC/public/foto.txt";
                        fs.writeFile(filePath, imagen2_R, (err)=>{
                            if (err) throw  err;
                            console.log("Nombre: "+imagen2_R)
                        })
                    }, 1000);
                    
                    var M = new PythonShell('motores.py')
                    M.send('principal_e')
                    M.on('message',function(message){
                        client.publish('1/autonomo',message)
                        M.end()
                        var MA = new PythonShell('motoresA.py')
                        MA.send('principal_e')
                        MA.on('message',function(message){
                            MA.end()   
                        })
                    })
                    pyF.end()
                })
            }else if(dataValue=='7FE0'&&con==1){
                con=0

            }
        }
        /*
        if(topic==lista_filtrada[0]){
            const data1=JSON.parse(message)
            const dataValue2 = data1.data.payload["/iolinkmaster/port[2]/iolinkdevice/pdin"].data
            if(dataValue2!='7FE0'){
                ver=1
            }else if(dataValue2=='7FE0'){
                ver=0
            }
        } 
        */
        if(message=='listo'){   
            if(contador==0){
                        //llega a maquina
                        //motores
                        console.log('listo 1')
                var pyM = new PythonShell('motores.py')
                pyM.send(lista_filtrada[0]+'_e')
                pyM.on('message',function(message){
                    client.publish('1/autonomo',message)
                    pyM.end()
                    var pyMA = new PythonShell('motoresA.py')
                    pyMA.send(lista_filtrada[0]+'_e')
                    pyMA.on('message',function(message){
                        //apaga motores
                        pyMA.end()
                        
                    })
                    
                })
                contador++
                console.log(contador)
            }else if(contador==1){
                                // se va de maquina
                client.publish('1/autonomo','verificacion_e')
                contador++
            }else if(contador==2){
                                //llega verificaciom
                contador++
                var pyM = new PythonShell('motores.py')
                pyM.send('principal_r')
                pyM.on('message',function(message){
                    client.publish('1/autonomo',message)
                    pyM.end()
                    var pyMA = new PythonShell('motoresA.py')
                    pyMA.send('principal_r')
                    pyMA.on('message',function(message){
                        //apaga motores verificacion
                        if(message==undefined){
                            imagen1_R='no tag'
                        }else{
                            imagen1_R = message.toString()
                        }
                    
                    var filePath = "C:/Users/ITLinares/Documents/CIM_TC/public/rfid.txt";
                    fs.writeFile(filePath, imagen1_R, (err)=>{
                        if (err) throw  err;
                        console.log("Nombre: "+imagen1_R)
                    })
                        
                       console.log(message)
                    pyMA.end()
                    })
                })
                try{
                    conexion.query('UPDATE maquinas set estado=? WHERE estacion=?',[0,lista_filtrada[0]], async(error, results)=> {
                        if (error) {
                            console.log(error);
                        }
                    });
                    
                }catch(error){
                    console.log(error)
                }
            }else if(contador==3){
                //se va de verificacion
                client.publish('1/autonomo','almacen_e')

                contador++
            }else if(contador==4){
                //mensaje robot
                var final
                conexion.query('SELECT A2_C1, A2_C2, A2_C3 FROM almacen',(error,results)=>{
                    var result = Object.values(JSON.parse(JSON.stringify(results)))
                   for(let i=0; i<result.length;i++){
                        if(result[i].A2_C1==0){
                            columnaE="A2_C1"
                            filaE=i+1
                            console.log(columnaE+"_F"+filaE)
                            final=columnaE+"_F"+filaE
                            var robot2= new PythonShell('robot2.py')
                            console.log(columnaE+"_F"+filaE)
                            robot2.send(final)
                            robot2.on('message',function(message){
                                robot2.end()
                            })
                            break
                        }else if(result[i].A2_C2==0){
                            columnaE="A2_C2"
                            filaE=i+1
                            console.log(columnaE+"_F"+filaE)
                            final=columnaE+"_F"+filaE
                            var robot2= new PythonShell('robot2.py')
                            console.log(columnaE+"_F"+filaE)
                            robot2.send(final)
                            robot2.on('message',function(message){
                                robot2.end()
                            })
                            break
                        }else if(result[i].A2_C3==0){
                            columnaE="A2_C3"
                            filaE=i+1
                            console.log(columnaE+"_F"+filaE)
                            final=columnaE+"_F"+filaE
                            var robot2= new PythonShell('robot2.py')
                            console.log(columnaE+"_F"+filaE)
                            robot2.send(final)
                            robot2.on('message',function(message){
                                robot2.end()
                            })
                            break
                        }
                   }
                })
                
                res.redirect('/index')
                client.end()
            }               
            
        }
    }

    client.on('connect', conectar)
    client.on('message', mensaje)
})

app.get('/resultados',(req,res)=>{
    /*
    fs.readFile("C:/Users/ITLinares/Documents/CIM_TC/public/foto.txt", function (err, data) {
        
        foto=data.toString()
        console.log(foto)
        fs.readFile("C:/Users/ITLinares/Documents/CIM_TC/public/rfid.txt", function(err,data){
            RFID=data.toString()
            fs.readFile("C:/Users/ITLinares/Documents/CIM_TC/public/aprueba.txt", function(err,data){
                aprueba=data.toString()
                
            })
        })  
        });
        */
       foto="conejo.jpg"
       RFID="##############"
       aprueba="Falta por aprobar"
       //comentarios para pruebas
        setTimeout(() => {
           res.render('paso3',{f:foto,prueba:aprueba,id:RFID}) 
        }, 1000);
                 //imagenes de verificacion
})
app.get('/vista',(req,res)=>{
    res.render('medicionP1')
})

server.listen(port, hostname, () => {
    console.log('server runing at', hostname)
});