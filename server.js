const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const db = require('./db');
const axios = require('axios');

app.use(cors());
app.use(express.json());

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('GET /users - DB ERROR', { error: err && err.message, sql });
            return res.status(500).json({ error: 'Database error', details: err?.message });
        }
        return res.json(data);
    });
});

app.post('/users', (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'name is required' });
    }
    
    if (!req.body.highScore && req.body.highScore !== 0) {
        return res.status(400).json({ error: "highScore is required" });
    }
    
    const sql = "INSERT INTO users (name, highScore) VALUES (?, ?)";
    const values = [
        req.body.name,
        req.body.highScore
    ];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('POST /users - DB ERROR', { error: err && err.message, sql, values, body: req.body });
            return res.status(500).json({ error: 'Database error', details: err?.message });
        }
        return res.json({ message: "User added", id: data.insertId });
    });
});

app.delete('/users/:id', (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, data) => {
        if (err) {
            console.error('DELETE /users/:id - DB ERROR', { error: err && err.message, sql, id });
            return res.status(500).json({ error: 'Database error', details: err?.message });
        }
        return res.json("User deleted");
    });
});

app.put('/users/:id', (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'name is required' });
    }
    
    if (!req.body.highScore && req.body.highScore !== 0) {
        return res.status(400).json({ error: "highScore is required" });
    }
    
    const sql = "UPDATE users SET name = ?, highScore = ? WHERE id = ?";
    const id = req.params.id;
    const values = [req.body.name, req.body.highScore, id];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error('PUT /users/:id - DB ERROR', { error: err && err.message, sql, values, body: req.body });
            return res.status(500).json({ error: 'Database error', details: err?.message });
        }
        return res.json("User updated");
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});