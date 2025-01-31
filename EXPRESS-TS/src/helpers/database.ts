import { createPool, PoolOptions } from 'mysql2';

const access: PoolOptions = {
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    connectionLimit: Number(process.env.CONNECTION_LIMIT)
};

const pool = createPool(access);

export default pool;