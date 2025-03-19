const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        const token = jwt.sign(
            { user: { id: newUser._id, username: newUser.username, email: newUser.email } },
            process.env.JWT_SECRET,
            { expiresIn: '14d' }
        );

        res.status(201).json({ 
            message: 'User created successfully', 
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user: { id: user._id, username: user.username, email: user.email } },
            process.env.JWT_SECRET,
            { expiresIn: '14d' }
        );

        res.json({ 
            message: 'Login successful', 
            user: { id: user._id, username: user.username, email: user.email },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

router.get('/check-auth', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.json({ authenticated: false });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-password');
        
        if (!user) {
            return res.json({ authenticated: false });
        }

        res.json({ 
            authenticated: true, 
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

module.exports = router;