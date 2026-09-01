import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/auth', authRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on port 3000");
            console.log("MongoDB connected!");
        })
    }).catch(err => console.log(err.message))