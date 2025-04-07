const express = require("express");
const router = express.Router();

const AttendanceController = require("../controllers/attendance.controller");

router.get("/", AttendanceController.getAttendance);
router.post("/create", AttendanceController.createAttendance);

const AttendanceRoute = router;
module.exports = AttendanceRoute;
