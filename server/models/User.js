import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription: { type: String, enum: ["Free", "Premium"], default: "Free" },
})

const User = mongoose.model('User', userSchema);

export default User;
