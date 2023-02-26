
const dotenv = require('dotenv');
const uuid = require('uuid').v4;
dotenv.config();

const { createToken } = require('../middleware/cookie')

const Vonage = require('@vonage/server-sdk')
const vonage = new Vonage({
  apiKey: "062bbaca",
  apiSecret: "9eda11a3"
})

const connectToDatabase = require("../db").connectToDatabase;

let verifyRequestId;

let phoneNumber;

exports.SendSms = (req, res) => {
    phoneNumber = req.body.phoneNumber;
    let userName = req.body.userName;
    let token = uuid();
    vonage.verify.request(
        {
            number: phoneNumber,
            brand: "Vonage",
        },
        async (err, result) => {
            if (err) {
                console.error(err);
            } else {
                verifyRequestId = result.request_id;
                let user = {
                    phone: phoneNumber,
                    name : userName ,
                    token: token,
                    pin: verifyRequestId ,
                    usedToken :false,
                    tokenInitiatedOn: new Date().getTime(),
                }
                const dbConnection = await connectToDatabase();
                const db = dbConnection.db;
                const coll = await db.collection("users"); // users-collection name
                await coll.findOneAndUpdate(
                    {phone:phoneNumber} ,
                    { $set : user },
                    {upsert : true }
                ) 
                }
        }
    );

    res.status(201).json({
        success: true,
        message: "number recived",
        token: token
    });
};

exports.SendCode =  (req, res) => {
    const smsCode = req.body.code;
    const token = req.body.token;
    let phoneNumber = "";
    let userId = "";
   
    vonage.verify.check({
        request_id: verifyRequestId,
        code: smsCode
    },
        async (err, result) => {
            if (err) {
                console.error(err);
                res.status(201).json({success:false});
            } else {
                const dbConnection = await connectToDatabase();
                const db = dbConnection.db;
                const coll = await db.collection("users"); // users-collection name
                await coll.findOne({token: token , pin :verifyRequestId , usedToken: false}, async function(err, result) {
                    phoneNumber = result.phone;
                    userId = result._id;  
                    if (err) throw err;
                    else if(result.tokenInitiatedOn + 300000 > new Date().getTime()) {
                        const jwtToken = createToken(userId , phoneNumber);
                        let check = { token: token , pin :verifyRequestId , usedToken: false};
                        let newValues = { $set : {pin : smsCode ,usedToken: true, jwtToken: jwtToken}}
                        await coll.updateOne(check ,newValues , function(err, res) {
                            if (err) throw err;
                            console.log("update");
                        });
                       
                        res.cookie("user" , {jwtToken}, {
                            httpOnly: true,
                            maxAge: 15720000000, // 182 days
                        })

                    }
                    else {
                        console.log("time is not good")
                        res.status(201).json({success:false});
                    }
                    let newUser = await coll.find({token: token , pin :smsCode}).toArray();
                    console.log(newUser)
                    res.status(201).json({user:newUser[0]});
                });
               
            }
        });
};

// exports.CancelCode = async (req, res) => {
//     vonage.verify.control({
//         request_id: verifyRequestId,
//         cmd: 'cancel'
//     }, (err, result) => {
//         if (err) {
//             console.error(err);
//         } else {
//             console.log(result);
//         }
//     });
//     res.status(201).json({
//         success: true,
//         message: "request cancel",
//     });
// };

