const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
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


// Check direct access to database through url of endpoints

/////////////////////////////////////////////////////////////

// Create a connection pool rather than a single connection
const db = mysql.createPool({
    connectionLimit: 10, // Adjust based on your application's requirement
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
    database: process.env.DBNAME
});

// Attempt to get a connection from the pool
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to database with thread ID: ' + connection.threadId);

    // When done with the connection, release it back to the pool
    connection.release();
});

// Handle connection errors for connections that are already in use
db.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId);
});

db.on('release', (connection) => {
    console.log('Connection %d released', connection.threadId);
});

// Catch errors on the pool
db.on('error', (err) => {
    console.error('Database error: ' + err.message);
    // Handle error and possibly re-establish connection here
});

setInterval(() => {
    db.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Error when sending keepalive query to MySQL.');
        }
    });
}, 600000); // every 10 minutes

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