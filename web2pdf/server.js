#!/usr/bin/env nodejs
'use strict';
 const fs = require('fs'); 
 const express = require('express'); 
 const spawn = require('child_process').spawn; 
 const bodyParser = require('body-parser'); 
 const pdfGenerate = require('./pdf-spawn'); 
 
 const dl = require('./dl');
const PORT = 8080;
const app = express(); 
//app.use(bodyParser.json()); 
//app.use(express.static('reports')); 

app.get('/pdf', async (req, res, next) => { 
// const apiKey = req.query.apikey; // // 
// Require API for get requests. // 
// if (!apiKey) { 
// // const msg = `Missing API key. Please include the key parameter`; // // res.status(403).send(`Missing API key. Please include the key parameter`); // // return; // // }
    try {
        const url = req.query.url;
        const data = await pdfGenerate(url);
        res.contentType("application/pdf");
        res.send(data);
    }
    catch (e) {
        next(e);
    }
});
app.get('/dl', async (req, res, next) => {
    try {
        const url = req.query.url;
        const path = await dl(url);
        fs.readFile(path, function (err, data) {
            res.contentType("application/pdf");
            res.send(data);
        });
    }
    catch (e) {
        next(e);
    }
});
app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
