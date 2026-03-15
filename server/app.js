const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(cors({ origin: true }));

const connectDB = require('./db/Connect');

const authRoutes = require("./routes/authRoute");
const searchRoutes = require("./routes/searchRoute");
const mediaRoutes = require("./routes/mediaRoute");
const permissionRoutes = require("./routes/permissionRoute");
const roomRoutes = require("./routes/roomRoute");

app.use("/api/", authRoutes);
app.use("/api/", searchRoutes);
app.use("/api/", mediaRoutes);
app.use("/api/", permissionRoutes);
app.use("/api/", roomRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB.execute("SELECT 1")
    .then(() => {
        console.log('Connected to the database');
        app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
    })
    .catch(err => console.log('DB connection failed. \n' + err));

