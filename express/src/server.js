require('dotenv').config()
var { Client } = require('pg');
const path = require('path');
var FormData = require('form-data');
var fetch = require('node-fetch');
var express = require('express');
const app = express()
var cors = require('cors')

const server = require('http').createServer(app);

var client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD
})

let device = Math.floor(Math.random() * 64)
let counter = 255;

app.use(cors({origin: '*', credentials: true}));


app.use(express.static('public'));

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

app.get('/api/create', async function (req, res) {

    if (req.query.link && req.query.link.length > 0 && isValidURL(req.query.link) && req.query.t && req.query.t.length > 0) {
        const SECRET_KEY = process.env.CLOUDFLARE;
        const token = req.query.t;
        const ip = req.headers['cf-connecting-ip']
        var form = new FormData();
        form.append('secret', SECRET_KEY);
        form.append('response', token);
        form.append('remoteip', ip);
        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const result = await fetch(url, {
            body: form,
            method: 'POST',
        });
        const outcome = await result.json();
        if (outcome.success) {

            id = (Math.random() + 1).toString(36).substring(6)

            let check = await client.query({ text: `SELECT * FROM links WHERE id = $1`, values: [id] })
            if (check.rows.length == 0) {
                client.query({ text: `INSERT INTO links VALUES ($1, $2, $3)`, values: [getId(1), id, req.query.link] }).then(response => {
                    res.status(200).json({ code: 200, status: true, serverTime: Date.now(), data: id })
                }).catch((err) => {
                    res.status(500).json({ code: 500, status: false, serverTime: Date.now(), message: 'Internal Server Error' })
                })
            } else {
                res.status(400).json({ code: 500, status: false, serverTime: Date.now(), message: 'Try Again, URL In Use' })
            }
        } else {
            res.status(400).json({ code: 500, status: false, serverTime: Date.now(), message: 'Invalid Captcha' })
        }
    } else {
        res.status(400).json({ code: 500, status: false, serverTime: Date.now(), message: 'Invalid URL' })
    }
});

app.get('/:route', function (req, res) {
    client.query({ text: `SELECT * FROM links WHERE id = $1`, values: [req.params.route] }).then(async (response) => {
        if (response.rows.length !== 0) {
            res.redirect(response.rows[0].link)
        } else {
            res.redirect('https://ut3.su')
        }
    }).catch((err) => {
        res.status(500).json({ code: 500, status: false, serverTime: Date.now(), message: 'Internal Server Error' })
    })
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

function getId(type) {
    if (counter == 255) { counter = 0 } else { counter++ }
    return BigInt('0b' + `${pad(parseInt(1).toString(2), 4)}${pad(parseInt(type).toString(2), 4)}${pad(parseInt(device).toString(2), 6)}${pad((counter).toString(2), 8)}${pad((Date.now()).toString(2), 42)}`)
}
  
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

server.listen(80, () => {
    console.log(`Listening on port 80`)
})

client.connect();