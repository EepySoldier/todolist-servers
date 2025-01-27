const express = require('express');
const router = express.Router();

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

                        res.send({ success: true, todos, uid: userId });
                    }
                );
            }
        }
    );
});

module.exports = router;