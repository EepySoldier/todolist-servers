const express = require('express');
const router = express.Router();

const pool = require('../database');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            if (rows.length === 0) {
                res.send(false);
            } else {
                res.send(true);
            }
        }
    );
});

module.exports = router;