const express = require("express");
const router = express.Router();

const AttendanceController = require("../controllers/attendance.controller");

router.post("/create", AttendanceController.createAttendance);
router.post("/get", AttendanceController.getAttendance);

const AttendanceRoute = router;
module.exports = AttendanceRoute;
