const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "faculty", "admin"], required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    nfcUID: { type: String, unique: true, required: true },
    userID: { type: String, unique: true, require: true },
    dep: {type: String, required: false}
}, { timestamps: true });

const UserModel =  mongoose.model("User", UserSchema);
module.exports = UserModel;