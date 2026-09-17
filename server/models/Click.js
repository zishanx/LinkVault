import mongoose from 'mongoose'

const clickSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link",
        required: true
    },
    country: {
        type:String,
        required: true
    }
}, { timestamps: true })