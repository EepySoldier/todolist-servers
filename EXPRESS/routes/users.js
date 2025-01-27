const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const pool = require('../database');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        [username.toString().toLowerCase(), password.toString().toLowerCase()],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (rows.length === 0) {
                res.status(401).send({ success: false, message: 'Invalid credentials' });
            } else {
                const userId = rows[0].id;
                pool.query(
                    'SELECT name, done FROM todos WHERE UID = ?',
                    [userId],
                    (err, todos) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Database error while fetching todos');
                        }

                        const user = {username: username, uid: userId}

                        const accessToken = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: '5m'})

                        res.send({ success: true, todos, accessToken: accessToken });
                    }
                );
            }
        }
    );
});

router.post('/logout', (req, res) => {

})

module.exports = router;