const { DownloaderHelper } = require('node-downloader-helper');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client,MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
let client;
let sessionData;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true,parameterLimit:50000,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', function(req, res) {
    res.send('Hola Mundo!');
  });

const sendWithApi = (req,res)=> {
    const {inc} = req.body;
    //const newNumber = `${to}@c.us`;
    console.log(req.body);
    const newNumber = "51998322450-1624176680@g.us";
    sendMessage(newNumber,inc);
    res.send({status:'Enviado'});
}

app.post('/send',sendWithApi);

const sendIncidencias = (req,res)=>{
    const {inc,grupo}=req.body;
    console.log(req.body);
    let to;
    switch(grupo){
        case 'cao': to="51981474883-1586953711@g.us"; break;
        case 'rec': to="51981359205-1525359181@g.us"; break;
        case 'dis': to="51981359205-1525362047@g.us"; break;
        default: to="51981359205@c.us";break;
    }
    let iphone='51960854060@c.us';
    to=iphone;
    sendMessage(to,inc);
    res.send({status:'WS Enviado'});
}
app.post('/incidencias',sendIncidencias);


const sendGraficos = (req,res)=>{
    const {tipo,grupo,img} = req.body;
    let to, envio;
    let iphone='51960854060@c.us';

    if(grupo=="cao"){
        to="51981474883-1586953711@g.us";
        //to=iphone;//"51981359205@c.us"
        sendMediaBase64(to,img);
        //res.send({status:'foto Enviado'});
        envio+=" CAO ";
    }
    if(tipo=="agua"){
        to="51981359205-1525362047@g.us";
        //to=iphone;//"51981359205@c.us"
        sendMediaBase64(to,img);
        //res.send({status:'foto Enviado'});
        envio+=" AGUA ";
    }
    if(tipo=="desague"){
        to="51981359205-1525359181@g.us";
        //to=iphone;//"51981359205@c.us"
        sendMediaBase64(to,img);
        //res.send({status:'foto Enviado'});
        envio+=" RECO ";
    }

    switch(grupo){
        //case 'cao': to="51981474883-1586953711@g.us"; break;
        //case 'rec': to="51981359205-1525359181@g.us"; break;
        //case 'dis': to="51981359205-1525362047@g.us"; break;
        case 'z':   to="51998322450-1624176680@g.us"; break;
        default: to="51981359205@c.us";break;
    }
    
    res.send({status:`DATOS FUERON ENVIADOS: ${envio}`});
}

app.post('/graficos_agua',sendGraficos);
app.post('/graficos_desague',sendGraficos);

const sendDocumentos = (req,res)=>{
    const {to,img} = req.body;
    let iphone='51960854060@c.us';
    //console.log(img);
    //console.log(__dirname);
    //to = iphone;

    const download = new DownloaderHelper(img.url, "./file/");
    download.on('end', () => {
        console.log('Download Completed');
        sendMediaPdf(iphone,img.filename);
    })
    download.start();
    
    //sendMediaBase64(to,img);
    res.send({status:'pdf Enviado'});
}

app.post('/send_documentos', sendDocumentos);

const sendJson = (req,res)=>{
}

app.get('/send2',(req,res)=>{
    res.send("Hola");
});


const estadoW = ()=>{
    client.getS
}

const SESSION_FILE_PATH = './session.json';

const withSession=()=>{
    // si existe cargamos el archivos con las credenciales
    sessionData = require(SESSION_FILE_PATH);

    client = new Client({session:sessionData});
    client.on('ready',()=>{
        console.log('cliente esta ready');
        listenMessage();
    });

    client.on("auth_failure",()=>{
        console.log("error de autenticacion, vuelve a generar el qrcode");

    });

    client.initialize();
}

const withOutSession = () =>{
    console.log("NO teenmos session guardada");
    client = new Client();
    client.on('qr', (qr) => {        
        qrcode.generate(qr,{small:true});
    });

    client.on('authenticated',(session)=>{
        //guardamos credenciales se session
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH,JSON.stringify(session), (err)=>{
            if(err) console.log(err);
        });
    });

    client.initialize();
}

/* function que se encarga de escuhar mesajes nuevos */
const listenMessage = ()=>{
    client.on("message", (msg) => {

        const {from,to,body} = msg;
        console.log(from,to,body);

        let iphone='51960854060@c.us';

        if(from===iphone){
            console.log(msg);
        }
        //grupo radio CAO 51981474883-1586953711@g.us
        //let from2 ="51998322450-1624176680@g.us";
        //sendMessage(from2,body);
        //sendMedia(from, 'a.jpg');
    }); 
}

const sendMediaBase64 = (to,file) =>{
    const mediaFile = new MessageMedia(file.mimetype,file.data,file.filename);
    //console.log(mediaFile);
    client.sendMessage(to,mediaFile);

}
const sendMediaPdf = (to,file) => {
    //let to2 = "51960854060@c.us";
    const mediaFile = MessageMedia.fromFilePath('./file/'+file);
    //console.log(mediaFile);
    //const media = new MessageMedia("string",file);
    client.sendMessage(to,mediaFile);
}

const sendMedia = (to,file) => {
    //let to2 = "51960854060@c.us";
    const mediaFile = MessageMedia.fromFilePath('./mediaSend/'+file);
    console.log(mediaFile);
    //const media = new MessageMedia("string",file);
    //client.sendMessage(to,mediaFile);
}

const sendMessage = (to, message) => {
    //let to2 = "51960854060@c.us";
    client.sendMessage(to,message);
}

/*

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});


*/
(fs.existsSync(SESSION_FILE_PATH))?withSession():withOutSession();

http.createServer({
    //key: fs.readFileSync('my_cert.key'),
    //cert: fs.readFileSync('my_cert.crt')
  }, app).listen(3000,() =>{
    console.log("My HTTPS server listening on port 3000...");
  });
