import axios from "axios";
import moment from "moment";
import { calculateDuration } from "../utils/dateCalculate";

const ENTRY_TIME = "09:00:00"; // 9 AM
const GRACE_PERIOD = 15; // 15 minutes

export const fetchAttendances = async (params) => {
  const response = await axios.get(`http://localhost:5000/attendances`, {
    params: {
      ...params,
    },
  });
  console.log("Attendance data:", response.data);
  const processedData = response.data.data.map((attendance) => {
    let status = "Absent";
    let lateDuration = null;
    let isLate = false;

    if (attendance.checkInTime) {
      const checkInMoment = moment(attendance.checkInTime);
      const entryMoment = moment(ENTRY_TIME, "HH:mm:ss");
      const diffMinutes = checkInMoment.diff(entryMoment, "minutes");

      if (diffMinutes <= GRACE_PERIOD) {
        status = "On Time";
      } else {
        const lateHours = Math.floor(diffMinutes / 60);
        const lateMins = diffMinutes % 60;
        lateDuration = `${lateHours > 0 ? lateHours + "h " : ""}${lateMins}m`;
        status = `Late (${lateDuration})`;
        isLate = true;
      }
    }

    return {
      ...attendance,
      name: attendance.userId?.name || "Unknown",
      department: attendance.userId?.dep || "N/A",
      profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        attendance.userId?.name || "Unknown"
      )}&background=random`,
      checkInTime: attendance.checkInTime ? moment(attendance.checkInTime).format("h:mm A") : "N/A",
      checkOutTime: attendance.checkOutTime ? moment(attendance.checkOutTime).format("h:mm A") : "N/A",
      duration:
        attendance.checkInTime && attendance.checkOutTime
          ? calculateDuration(attendance.checkInTime, attendance.checkOutTime)
          : "N/A",
      status,
      lateDuration,
      isLate,
      rawCheckInTime: attendance.checkInTime,
      date: moment(attendance.date).format("MMM D, YYYY"),
    };
  });

  return processedData;
};
