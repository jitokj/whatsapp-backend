const express = require('express');
const mongoose = require('mongoose');
const Cors = require('cors');
const Message = require("./dbMessages");

const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = process.env.PORT || 9000;
const Connection_url = process.env.API_URL;
app.use(express.json());
app.use(Cors());

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

mongoose.connect(Connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then((_)=>{
    console.log('connected to DATABASE!!')
    app.listen(port,()=>{
        console.log(`listening on http://localhost:${port}`);
    })
})
.catch((err)=>{
    console.log(err);
});

