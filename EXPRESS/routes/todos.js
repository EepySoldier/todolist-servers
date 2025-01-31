const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const pool = require('../database');

router.get('/fetch', authenticateToken, (req, res) => {
    const UID = req.user.uid;

    pool.query(
        'SELECT name, done FROM todos WHERE UID = ?',
        [UID],
        (err, result) => {
            if (err) {
                console.error(`Error while fetching todos: ${err}`);
                res.status(500).json({ error: "Internal server error." });
                return;
            }
            res.json({ todos: result });
        }
    );
})

router.post('/add', authenticateToken, (req, res) => {
    const { name } = req.body;
    const UID = req.user.uid;

    if (!name) {
        return res.status(400).json({ error: "Invalid Request" });
    }

    try {
        pool.query(
            'INSERT INTO todos (name, done, UID) VALUES (?, ?, ?)',
            [name, false, UID],
            (err) => {
                if (err) {
                    console.error(`Error while adding todo: ${err}`);
                    res.status(500).json({ error: "Internal server error." });
                    return;
                }
                res.json({ message: "Added todo."});
            }
        );
    } catch (error) {
        console.error(`Error while adding todo: ${error}`);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.patch('/update', authenticateToken, (req, res) => {
    const { oldName, newName } = req.body;
    const UID = req.user.uid;

    if (!oldName || !newName) {
        return res.status(400).json({ error: "Invalid Request" });
    }

    try {
        pool.query(
            'UPDATE todos SET name = ? WHERE name = ? AND UID = ?',
            [newName, oldName, UID],
            (err, result) => {
                if (err) {
                    console.error(`Error updating todo name: ${err}`);
                    res.status(500).json({ error: "Internal server error." });
                    return;
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Todo not found." });
                }
                res.json({ message: "Todo updated." });
            }
        );
    } catch (error) {
        console.error(`Error updating todo name: ${error}`);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.delete('/delete', authenticateToken, (req, res) => {
    const { name } = req.query;
    const UID = req.user.uid;

    if (!name) {
        return res.status(400).json({ error: "Invalid Request" });
    }

    try {
        pool.query(
            'DELETE FROM todos WHERE name = ? AND UID = ?',
            [name, UID],
            (err, result) => {
                if (err) {
                    console.error(`Error while deleting todo: ${err}`);
                    res.status(500).json({ error: "Internal server error." });
                    return;
                }
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: "Todo not found." });
                    return;
                }
                res.json({ message: "Todo deleted." });
            }
        );
    } catch (error) {
        console.error(`Error while deleting todo: ${error}`);
        res.status(500).json({ error: "Internal server error." });
    }
});

router.patch('/toggle', authenticateToken, (req, res) => {
    const { name, done } = req.body;
    const UID = req.user.uid;

    if (typeof done !== 'boolean' || !name) {
        res.status(400).json({ error: "Invalid request" });
        return;
    }

    try {
        pool.query(
            'UPDATE todos SET done = ? WHERE name = ? AND UID = ?',
            [done, name, UID],
            (err, result) => {
                if (err) {
                    console.error(`Error while toggling todo ${err}`);
                    res.status(500).json({ error: "Internal server error." });
                    return;
                }
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: "Todo not found." });
                    return;
                }
                res.json({ message: "Todo toggled." });
            }
        );
    } catch (error) {
        console.error(`Error while toggling todo ${error}`);
        res.status(500).json({ error: "Internal server error." });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token){
        res.status(401).json({ error: 'Token missing' });
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err){
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.user = user;
        next();
    });
}

module.exports = router;
