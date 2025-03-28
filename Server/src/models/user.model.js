const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "employee", "admin"], required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    nfcUID: { type: String, unique: true, required: true },
    userId: { type: String, unique: true, require: true },
    dep: {type: String, required: false},
    profilePic: { type: String, required: false },
    designation: { type: String, required: false },
    
}, { timestamps: true });

const UserModel =  mongoose.model("User", UserSchema);
module.exports = UserModel;




//employee   -> give punch nfc card -> read data -> ceheck if user exists -> if not create user -> if yes check if user is employee -> if yes check if user is already punched -> if yes return error -> if no punch user

