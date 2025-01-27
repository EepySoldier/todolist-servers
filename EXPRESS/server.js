require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:63342'
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const users = require('./routes/users');
app.use('/users', users);

const todos = require('./routes/todos');
app.use('/todos', todos);

app.listen(process.env.SERVER_PORT || 3000);