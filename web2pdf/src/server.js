#!/usr/bin/env nodejs
'use strict';
const express = require('express');

const pdf = require('./pageProcessors/pdf');
const print = require('./pageProcessors/dl');
const pipe = require('./pipeline');

const PORT = 8080;
const app = express();

const API_KEY = process.env.API_KEY;

const printPipeline = pipe(pdf);
const dlPipeline = pipe(print);

API_KEY && app.use(authMiddleware);

app.get('/pdf', async (req, res, next) => {
    processPdfRequest(req, res, next, printPipeline);
});

app.get('/dl', async (req, res, next) => {
    processPdfRequest(req, res, next, dlPipeline);
});

async function processPdfRequest(req, res, next, pipeline) {
    try {
        const url = req.query.url;
        const opts = parseOpts(req);
        const data = await pipeline(url, opts);
        res.contentType("application/pdf");
        res.send(data);
    }
    catch (e) {
        next(e);
    }
}

function authMiddleware(req, res, next) {
    const apiKey = req.query.apiKey;
    if (!apiKey) {
        // TODO uncomment when all clients moved
        // res.status(403).send(`Missing API key. Please include the key parameter`);
        // return;
    } else if (apiKey !== API_KEY) {
        res.status(403).send(`Nonexistent API key`);
        return;
    }

    next();
}

function parseOpts(req) {
    return {
        windowStatus: req.query.windowStatus
    }
}

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
