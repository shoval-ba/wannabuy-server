
const connectToDatabase = require("../db").connectToDatabase;
const  ObjectID = require('mongodb').ObjectId;


exports.deleteDeal = async (req, res) => {
    let deal = req.body.deal; 
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const dealsColl = await db.collection("deals"); // deals-collection name

    const chatsColl = await db.collection("chats")

    await chatsColl.deleteMany({dealId : ObjectID(deal._id)});

    await dealsColl.deleteOne({_id:ObjectID(deal._id)} , function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        res.json({success:true});
      });
}

exports.logout = async (req, res) => {
  res.clearCookie("user");
  res.json({success : true})
}