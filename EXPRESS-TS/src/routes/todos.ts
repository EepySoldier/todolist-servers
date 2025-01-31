import express, { Express, Request, Response, NextFunction } from "express";
import "types/express"
import jwt from 'jsonwebtoken';
import pool from '../helpers/database';
const router = express.Router();

router.get('/fetch', authenticateToken, (req: Request, res: Response): void => {
    if (!req.user) {
        res.status(401).send({ error: "Unauthorized" });
        return;
    }

    const UID = req.user.uid;

    pool.query(
        'SELECT name, done FROM todos WHERE UID = ?',
        [UID],
        (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send({ error: 'Error fetching todos' });
                return;
            }
            res.json({ todos: results });
        }
    );
});


function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).send({ error: 'Token missing' });
        return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("TOKEN_SECRET is not defined.");
        res.status(500).send({ error: 'Internal server error' });
        return;
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            res.status(403).send({ error: "Invalid or expired token" });
            return;
        }

        if (typeof decoded === "object" && decoded !== null) {
            req.user = decoded as { username: string; uid: number };
        } else {
            res.status(403).send({ error: "Invalid token structure" });
            return;
        }

        next();
    });
}



export default router;