const AttendanceModel = require("../models/attendance.model");
const UserModel = require("../models/user.model");
const moment = require("moment");

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
  const { userId, day, month, year } = req.query;
  const query = {};

  // 1. Handle userId lookup
  if (userId) {
    const user = await UserModel.findOne({ userId });
    if (!user) throw new Error("User not found");

    query.userId = user._id;
  }

  // 2. Date filtering with Moment.js
  if (year) {
    let startDate, endDate;

    if (month && day) {
      // Specific day
      startDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD").startOf("day");
      endDate = moment(startDate).endOf("day");
    } else if (month) {
      // Entire month
      startDate = moment(`${year}-${month}`, "YYYY-MM").startOf("month");
      endDate = moment(startDate).endOf("month");
    } else {
      // Entire year
      startDate = moment(year, "YYYY").startOf("year");
      endDate = moment(startDate).endOf("year");
    }

    query.date = {
      $gte: startDate.toDate(),
      $lte: endDate.toDate(),
    };
  }

  // 3. Execute query
  const attendance = await AttendanceModel.find(query).populate("userId", "name email department");
   console.log(attendance);
  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance,
  });
};

const AttendanceController = {
  createAttendance,
  getAttendance,
};

module.exports = AttendanceController;
