const dotenv = require('dotenv');
// console.log(process.env)
const client = require('./conn');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
dotenv.config({ path: './config.env' });

const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = process.env.PORT;
app.use(bodyParser.json());

console.log(process.env.SECRET_KEY);
app.use(require('./router/auth'));
app.use(require('./router/postassg'));
app.use(require('./router/stdauth'));

app.use(require('./router/submitassg'))
app.use(require('./router/studentdetailsSubmited'))

app.get('/',(req,res)=>{
    res.end("hi hello");
})

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
