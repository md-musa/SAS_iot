import moment from "moment";

export const calculateDuration = (start, end) => {
  const startTime = moment(start);
  const endTime = moment(end);
  const duration = moment.duration(endTime.diff(startTime));
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  return `${hours}h ${minutes}m`;
};
