const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },// get today's date ex 2021-09-01
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null },
    status: { type: String, enum: ["present", "absent", "leave"], required: true }
}, { timestamps: true });

const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);
module.exports = AttendanceModel;