import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clickCount: { type: Number, default: 0 },
    order: { type: Number, required: true }
}, { timestamps: true })

const Link = mongoose.model('Link', linkSchema)

export default Link