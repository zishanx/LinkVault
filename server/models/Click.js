import mongoose from 'mongoose'

const clickSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link",
        required: true
    },
    country: {
        type: String,
    }
}, { timestamps: true })

const Click = mongoose.model("Click", clickSchema)

export default Click