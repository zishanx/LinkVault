import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true , select: false},
    subscription: { type: String, enum: ["Free", "Premium"], default: "Free" },
})

const User = mongoose.model('User', userSchema);

export default User;
