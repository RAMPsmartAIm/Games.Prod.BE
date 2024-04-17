const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
// const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express()
app.set('trust proxy', true)
const fs = require('fs');
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
// app.use(rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// }));

// Check direct access to database through url of endpoints

/////////////////////////////////////////////////////////////

const db = mysql.createConnection({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: process.env.DBNAME,
});

// Log to database
// const db = mysql.createConnection({
//     username: "doadmin",
//     password:"AVNS_W0Yt6YIO1n5f14d5rP2",
//     host: "db-mysql-fra1-games-do-user-8614869-0.c.db.ondigitalocean.com",
//     port: "25060",
//     database: "quiz_database",
// });

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database with thread ID: ' + db.threadId);
});

db.on('error', (err) => {
    console.error(`Database error: ${err.message}`);
});
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