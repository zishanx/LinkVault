import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.user_id)
            if (!req.user) {
                return res.status(401).json({ message: "no user found" })
            }
            next()
        } else {
            res.status(401).json({ message: "token not found" });
        }


    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}