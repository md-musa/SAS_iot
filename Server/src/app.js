require('express-async-errors');
require('dotenv').config();
const express = require('express');

const app = express();
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./utils/db_connection');
const UserRoute = require('./routes/user.route');

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('PATH  ==> ', req.path);
    console.log(req.body)
    console.log(req.query)
    next();
});

app.use('/users', UserRoute);


// app.post("/receive-uid", (req, res) => {
//     const { uid } = req.body;
//     console.log("Received UID:", uid);
//     res.json({ message: "UID received successfully", uid });
// })
app.use(errorHandler);

app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
    console.log(`-> Server running at port ${process.env.PORT} ...`)
});