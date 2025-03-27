const AttendanceModel = require("../models/attendance.model");
const UserModel = require("../models/user.model");

const createAttendance = async (req, res) => {
  const { nfcUID } = req.body;
  if (!nfcUID) throw new Error("nfcUID is required");

  const user = await UserModel.findOne({ nfcUID }); 
  if (!user) throw new Error("Invalid User");
  console.log(user);

  const userId = user._id; 

  const todaysAttendance = await AttendanceModel.findOne({
    userId, 
    date: new Date().toISOString().split("T")[0], 
  });
  console.log(todaysAttendance);

  if (todaysAttendance) {
    if (todaysAttendance.checkOutTime) {
      res.status(400).json({
        message: "Already checked out",
        name: user.name,
        userId: user.userId,
      });
    } else {
      todaysAttendance.checkOutTime = new Date();
      await todaysAttendance.save();
      res.status(200).json({
        message: "Check-out successful",
        name: user.name,
        userId: user.userId,
      });
    }
  } else {
    // create a new attendance
    const attendance = new AttendanceModel({
      userId, 
      date: new Date().toISOString().split("T")[0], // Ensure the date is in YYYY-MM-DD format
      checkInTime: new Date(),
      status: "present",
    });
    await attendance.save();
    res.status(201).json({
      message: "Check-in successful",
      name: user.name,
      userId: user.userId,
    });
  }
};

const getAttendance = async (req, res) => {
  console.log(req.body);
  const { nfcUID } = req.body;
  if (!nfcUID) throw new Error("nfcUID is required");

  const attendance = await AttendanceModel.find({ nfcUID });
  res.json(attendance);
};

const AttendanceController = {
  createAttendance,
  getAttendance,
};

module.exports = AttendanceController;
