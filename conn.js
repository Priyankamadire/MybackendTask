const dotenv = require('dotenv');
const {Client} = require('pg');
dotenv.config({ path: './config.env' });
  
console.log(process.env.POSTGRES_URL)
// const client = new Client({
//     host:"localhost",
//     port:5432,
//     user:"postgres",
//     password:"123456",
//     database:"MyProject"
// })  

const client = new Client({
    connectionString: process.env.POSTGRES_URL ,
  })
client.on("connect",()=>{
    console.log("Database connection");
})
client.on("end",()=>{
    console.log("Connection end")
})
module.exports=client;