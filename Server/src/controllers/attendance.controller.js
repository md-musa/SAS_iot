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
  const {employeeId, date, range } = req.query;
  const query = {};
  console.log("Query params:", req.query);

  if (employeeId) {
    const user = await UserModel.findOne({ userId: employeeId });
    if (!user) throw new Error("Invalid User ID");
    query.userId = user._id;
  }

  if (date) {
    const startDate = moment(date).startOf(range);
    const endDate = moment(date).endOf(range);

    query.date = {
      $gte: startDate.toDate(),
      $lte: endDate.toDate(),
    };
  }

  // 3. Execute query
  const attendance = await AttendanceModel.find(query).populate("userId", "name email userId department profilePic").lean();

 // console.log(attendance);
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
