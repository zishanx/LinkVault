import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
    const { name, username, email, password } = req.body;
    const UserExists = await User.findOne({
        email, username
    });

    if (UserExists) {
        return res.status(400).json({ message: 'User already exists' });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({ message: 'User created successfully', user });
    }
}

export const login = async (req,res) => {
    
}