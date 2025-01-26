require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

const users = require('./routes/users')

app.use('/users', users)

app.listen(process.env.SERVER_PORT);