require('dotenv').config();
import express, { Express, Request, Response } from "express";
import cors from 'cors';
import users from './routes/users'
import todos from './routes/todos'
const app: Express = express();

app.use(cors({
    origin: 'http://localhost:63342'
}));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.use('/users', users);
app.use('/todos', todos);

app.listen(process.env.SERVER_PORT || 3000);