var express= require('express');
var app=express();

//connecting server file for AWT
let server = require('./server');
let middleware = require('./middleware');

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

const dbName='hosp';
const url='mongodb://localhost:27017';
let db
MongoClient.connect(url,{ useUnifiedTopology: true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
    console.log("connected.....");
});

//fetching hospital details
app.get('/hospitaldetails',middleware.checkToken, function(req,res){
    console.log("Fetching data from the hospital collection of hospitalmanagement database");
    var data = db.collection('hospital').find().toArray()
    .then(result => res.json(result));
});

// fetching Ventiolator details
app.get('/ventilatordetails',middleware.checkToken,(req,res) => {
    console.log("Fetching data from the ventiloators collection of hospitalmanagement database");
    var ventilatordetail = db.collection('ventilator').find().toArray()
    .then(result => res.json(result));

});

//search hospital by name
app.post('/searchhospital',middleware.checkToken,(req,res) =>{
    console.log("searching hospital by name");
    var name = req.query.name;
    console.log(name);
    var hospitaldetails = db.collection('hospital')
    .find({ "name" : new RegExp(name, 'i')}).toArray().then(result => res.json(result));

});

//finding ventilator by name of the hospital
app.post('/searchventilatorbyname',middleware.checkToken,(req,res) => {
    console.log("searching ventilator by hospital name");
    var name =req.query.name;
    console.log(name);
    var ventilatordetail = db.collection('ventilator').find({'name':new RegExp(name,'i')}).toArray().then(result => res.json(result));
});


//finding ventilators by status
app.post('/searchventilatorbystatus',middleware.checkToken,(req,res) =>{
    console.log("searching ventilator by status");
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('ventilator')
    .find({ "status" : status }).toArray().then(result => res.json(result));

});

//updating ventilator details 
app.put('/updateventilatordetails',middleware.checkToken,(req,res) =>{
    var ventid = { vid: req.body.vid };
    console.log(ventid);
    var newvalues = { $set: { status: req.body.status } };
    db.collection('ventilator').updateOne(ventid, newvalues,function (err, result){
        res.json('1 document updated in collection');
        if(err) throw err;
    });
});

//add ventilator
app.post('/addventilatorbyuser',middleware.checkToken, (req,res) => {
    var hId= req.body.hid;
    var ventilatorId=req.body.vid;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hId:hid, ventilatorId:vid, status:status, name:name
    };
    db.collection('ventilator').insertOne(item, function (err, result){
        res.json('new item inserted');
    });
});

//delete ventilator by ventilatorid
app.delete('/delete',middleware.checkToken,(req,res) => {
    var myquery = req.query.vid;
    console.log(myquery);

    var myquery1 = { vid: myquery };
    db.collection('ventilator').deleteOne(myquery1,function (err,obj)
    {
        if(err) throw err;
        res.json("1 document is deleted from collection");
    });
});

app.listen(8080);

