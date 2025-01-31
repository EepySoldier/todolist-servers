declare namespace Express {
    export interface Request {
        user: { username: string; uid: number };
    }
}