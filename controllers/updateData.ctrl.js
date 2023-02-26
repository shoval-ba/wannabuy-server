const connectToDatabase = require("../db").connectToDatabase;

exports.updateCategory = async (req, res) => {
    let oldName = req.body.oldName;
    let newName = req.body.newName;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const coll = await db.collection("storeCategories"); // storeCategories-collection name
    var myquery = { name: oldName };
    var newvalues = { $set: {name: newName } };
    coll.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });
    res.status(201).json({success : true});
};

exports.updateDealType = async (req, res) => {
    let oldName = req.body.oldName;
    let newName = req.body.newName;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const coll = await db.collection("dicDealTypes"); // dicDealTypes-collection name
    var myquery = { name: oldName };
    var newvalues = { $set: {name: newName } };
    coll.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });
    res.status(201).json({success : true});
};

exports.updateDicStore = async (req, res) => {
    let dicStore = req.body.dicStore; 
    let oldName = req.body.oldName;
    let categoryExist;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const dicStoresColl = await db.collection("dicStores"); // dicStores-collection name

    const storeCategorysColl = await db.collection("storeCategories");
    categoryExist = await storeCategorysColl.find({name : dicStore.category}).toArray();

    if(categoryExist.length === 0){
        res.status(201).json({success : false , error:"name of category doesn't exist"});
        return;
    }
    
    let categoryId = categoryExist[0]._id;

    dicStore = {
        name : dicStore.name , 
        logo : dicStore.logo , 
        categoryId : categoryId
    }
    
    var myquery = { name: oldName };
    var newvalues = { $set: dicStore };
    dicStoresColl.updateOne(myquery, newvalues, function(err, res) {
        if (err) res.status(201).json({success : false});;
        console.log("1 document updated");
      });
    res.status(201).json({success : true});
    }

exports.updateBranch = async (req, res) => {
    let oldBranch = req.body.oldBranch;
    let branch = req.body.branch; 
    let storeExist;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const branchsColl = await db.collection("branches"); // branches-collection name
    
    const storesColl = await db.collection("dicStores");
    storeExist = await storesColl.find({name: branch.storeName}).toArray();
    
    if(storeExist.length === 0 ) {
        res.status(201).json({success : false , error: "name of store doesn't exist"});
        return;
    }
    
    let StoreId = storeExist[0]._id
    
    branch = {
        name : branch.name ,
        coords : branch.coords , 
        floor : branch.floor ,
        StoreId : StoreId
    }
   
    var myquery = { oldBranch };
    var newvalues = { $set: branch };
    branchsColl.updateOne(myquery, newvalues, function(err, res) {
        if (err) res.status(201).json({success : false});;
        console.log("1 document updated");
      });
    res.status(201).json({success : true});
};