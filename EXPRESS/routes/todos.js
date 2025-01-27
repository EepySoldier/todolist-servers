const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const pool = require('../database');

router.post('/save', authenticateToken, (req, res) => {
    const { todos } = req.body;
    const UID = req.user.uid;

    pool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).send('Error getting database connection');
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).send('Error starting transaction');
            }

            connection.query(`DELETE FROM todos WHERE UID = ?`, [UID]);

            todos.forEach(([todoName, done]) => {
                connection.query(
                    'INSERT INTO todos (name, done, UID) VALUES (?, ?, ?) ' +
                    'ON DUPLICATE KEY UPDATE done = VALUES(done)',
                    [todoName, done, UID],
                    (err) => {
                        if (err) {
                            connection.rollback(() => {
                                connection.release();
                                return res.status(500).send('Error inserting/updating todo');
                            });
                        }
                    }
                );
            });

            connection.commit((err) => {
                if (err) {
                    connection.rollback(() => {
                        connection.release();
                        return res.status(500).send('Error committing transaction');
                    });
                }

                connection.release();
                res.send({ message: 'Todos saved successfully' });
            });
        });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        req.user = user;
        next();
    })
}

module.exports = router;
