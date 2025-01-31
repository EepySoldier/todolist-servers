const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const pool = require('../database');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, result) => {
            if (err) {
                console.error(`Error while retrieving users ${err}`);
                res.status(500).json({ error: "Internal server error." });
                return;
            }

            if (result.length === 0) {
                res.status(401).json({ error: "Invalid username or password" });
            } else {
                const userId = result[0].id;
                pool.query(
                    'SELECT name, done FROM todos WHERE UID = ?',
                    [userId],
                    (err, result) => {
                        if (err) {
                            console.error(`Error while retrieving todos ${err}`);
                            res.status(500).send({ error: "Internal server error." });
                            return;
                        }

                        const user = {username: username, uid: userId}

                        const accessToken = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: '5m'})

                        res.send({ success: true, result, accessToken: accessToken });
                    }
                );
            }
        }
    );
});

module.exports = router;