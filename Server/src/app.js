require("express-async-errors");
require("dotenv").config();
const express = require("express");

const app = express();
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./utils/db_connection");
const UserRoute = require("./routes/user.route");
const AttendanceRoute = require("./routes/attendance.route");

connectDB();

// Task
// 1. can to check out within 1 hour of check in
// 2. can check in only once a day
// 3. can check out only once a day
// 4. can check in only if check out is done
// 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("PATH  ==> ", req.path);
  console.log(req.body);
  console.log(req.query);
  next();
});

app.use("/users", UserRoute);
app.use("/attendances", AttendanceRoute);

app.use(errorHandler);

app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`-> Server running at port ${process.env.PORT} ...`);
});
