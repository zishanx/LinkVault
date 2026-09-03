import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }
})

const Link  = mongoose.model('Link', linkSchema)