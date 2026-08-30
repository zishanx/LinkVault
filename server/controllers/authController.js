import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
    const { name, username, email, password } = req.body;
    const isEmail = await User.findOne({ email });
    const isUsername = await User.findOne({ username });

    if (isEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    if (isUsername) {
        return res.status(400).json({ message: "Username already exists" })
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        username,
        email,
        password: hashedPassword
    });
    const { password: _, ...userWithoutPassword } = user.toObject()

    res.status(201).json({ message: 'User created successfully', userWithoutPassword });

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        const { password: _, ...userWithoutPassword } = user.toObject()

        res.status(200).json({ user: userWithoutPassword , token }, )
    } else {
        return res.status(401).json({ message: "Incorrect Password" })
    }

}