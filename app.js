const express = require("express");
var axios = require("axios");
const app = express();
const bodyParser = require("body-parser");
const Sms = require("./routes/sms.route");
const GetData = require("./routes/getData.route");
const addData = require("./routes/addData.route");
const updateData = require("./routes/updateData.route");
const getNames = require("./routes/getNames.route");
const deleteData = require("./routes/deleteData.route");
const dataByLocation = require("./routes/dataByLocation.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors());

var allowlist = [
    "https://63f6123ebf403c00081eb54a--wannabuy2.netlify.app/",
    "http://localhost:5173",
    "http://localhost:8100",
    "http://localhost:8080",
    'http://localhost',
    'capacitor://localhost',
    'ionic://localhost',
     "*"];

var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    corsOptions = { origin: true };
    // if (allowlist.indexOf(req.header("Origin")) !== -1) {
    //     corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    // } else {
    //     corsOptions = { origin: false }; // disable CORS for this request
    // }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(cors(corsOptionsDelegate));

const allowedOrigins = [
    "https://63f6123ebf403c00081eb54a--wannabuy2.netlify.app/",
    'capacitor://localhost',
    'ionic://localhost',
    "http://localhost:5173",
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100',
     "*"
];

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
};

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS");
    res.header("Cache-Control", "max-age=864000"); // cache images
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Host ,Authorization ");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/sms", Sms);
app.use("/api/getData", GetData);
app.use("/api/addToData", addData);
app.use("/api/updateData", updateData);
app.use("/api/getNames", getNames);
app.use("/api/delete", deleteData);
app.use("/api/getDataByLocation", dataByLocation);

module.exports = app;