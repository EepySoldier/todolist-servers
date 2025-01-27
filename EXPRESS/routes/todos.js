const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const pool = require('../database');

router.get('/fetch', authenticateToken, (req, res) => {
    const UID = req.user.uid;

    pool.query(
        'SELECT name, done FROM todos WHERE UID = ?',
        [UID],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching todos');
            }
            res.send({ todos: rows });
        }
    );
})

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
    if (!token) return res.status(401).send({ error: 'Token missing' });

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

module.exports = router;
