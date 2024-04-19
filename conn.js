const dotenv = require('dotenv');
const { Client } = require('pg');
dotenv.config({ path: './config.env' });

console.log(process.env.POSTGRES_URL);

// If you're using a connection string from environment variables
const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    } 
});

client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err));

module.exports = client;

client.on("end", () => {
    console.log("Connection end");
});
