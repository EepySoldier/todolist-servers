import express, { Express, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import pool from '../helpers/database';
const router = express.Router();

type TUser = {
    id: number;
    username: string;
    password: string;
}

router.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if(err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            const rows = results as TUser[];

            if(rows.length === 0) {
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

                        const user = { username: username, uid: userId };

                        const secret = process.env.TOKEN_SECRET;

                        if(!secret) {
                            console.error("TOKEN_SECRET is not defined");
                            return res.status(500).send("Internal server error");
                        }

                        const accessToken = jwt.sign(user, secret, {expiresIn: '5m'});

                        res.send({ success: true, todos, accessToken: accessToken });
                    }
                )
            }
        }
    )
})




export default router;