const express = require('express');
const mongoose = require('mongoose');
const Cors = require('cors');
const Message = require("./dbMessages");
const Pusher = require("pusher");

const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = process.env.PORT || 9000;
const Connection_url = process.env.API_URL;
app.use(express.json());
app.use(Cors());
const db = mongoose.connection;


const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });

app.post("/messages/new",(req,res)=>{
    const dbMessage = req.body;
    Message.create(dbMessage,(err,data)=>{
        if(err)
        {
            res.status(500).send(err);
        }
        else{
            res.status(201).send(`new messages created:\n ${data}`);
        }
    })
})

app.get('/messages/sync',(req,res)=>{
    Message.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else {
            res.status(200).send(data);
        }
    })
})
app.get('/',(req,res)=>{
    res.status(200).send('hello world');
});


db.once("open",()=>{
    console.log('db connected');
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();
    changeStream.on("change",(change)=>{
       if(change.operationType === "insert"){
           const messageDetails = change.fullDocument;
           pusher.trigger('messages','inserted',{
               name: messageDetails.name,
               message: messageDetails.message,
               timestamp: messageDetails.timestamp,
               received :messageDetails.received
           })
          
       }
       else{
           console.log('Error triggering pusher');
       }
    })
})

mongoose.connect(Connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then((_)=>{
   
    app.listen(port,()=>{
        console.log(`listening on http://localhost:${port}`);
    })
})
.catch((err)=>{
    console.log(err);
});

