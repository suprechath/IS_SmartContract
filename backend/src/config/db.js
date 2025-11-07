import pg from 'pg';
import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_DBPORT
});

pool.on('connect', () => {
    console.log('Connection pool established with the database');
});

//can only press a button to get
// module.exports = {
//   query: (text, params) => pool.query(text, params),
// };

// having the key to the entire machine
export default pool;

