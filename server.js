const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
// HTTPS
// const https = require('https');
// const fs = require('fs');
require('dotenv').config();

const app = express()
const MYSQL_CON = process.env.MYSQLCONSTRING
const PORT = process.env.PORT


// Secure Server-side ////////////////////////////////////// 

// Use Morgan middleware for logging (Log monitoring in console)
app.use(morgan('combined'));

// Configure CORS
app.use(cors({
    methods: ['GET'],
    allowedHeaders: ['Content-Type'], // Allowed headers, ("Authorization" if needs to send tokend e.g)
    credentials: false, // Allow sending cookies and authentication headers
    optionsSuccessStatus: 200 // Return 200 for successful OPTIONS requests
}));

// Set rate limit
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));

// Check direct access to database through url of endpoints

/////////////////////////////////////////////////////////////

// Log to database
const db = mysql.createConnection({
    MYSQL_CON
})

// End points
app.get("/question/:id", (req, res)=> {
    const questionId = req.params.id;

    const sql = "SELECT * FROM questions WHERE id=?";
    db.query(sql, [questionId], (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get("/questions_len", (req, res)=> {
    const sql = "SELECT COUNT(*) as len FROM questions;";
    
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

// HTTPS
// const options = {
//     key: fs.readFileSync('path/to/privatekey.pem'),
//     cert: fs.readFileSync('path/to/certificate.pem')
// };
  
// https.createServer(options, app).listen(443);
