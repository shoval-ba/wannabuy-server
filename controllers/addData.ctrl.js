
const connectToDatabase = require("../db").connectToDatabase;
const  ObjectID = require('mongodb').ObjectId;


exports.addDealTypes = async (req, res) => {
    let dealType = {
        name : req.body.dealType
    }
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const dicDealTypesColl = await db.collection("dicDealTypes"); // dealTypes-collection name
    let dealExist = await dicDealTypesColl.find({name : dealType.name}).toArray()
    if(dealExist.length !== 0) res.status(201).json({success : false  , error: "dealType already exist"})
     else {
            dicDealTypesColl.insertOne(dealType , function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        })
        res.status(201).json({success : true});
    }
}

exports.addChat = async (req, res) => {
    let message = req.body.message;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const chatColl = await db.collection("chats");
    let newMessage = {
      dealId : ObjectID(message.dealId) ,
      message : message.message ,
      userId : ObjectID(message.user._id) ,
      timeSend : message.timeSend, 
    }
    chatColl.insertOne(newMessage)
}

exports.addStoreCategory = async (req, res) => {
    let storeCategory = {
        name : req.body.storeCategory
    }
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const storeCategorysColl = await db.collection("storeCategories"); // storeCategories-collection name
    let categoryExist = await storeCategorysColl.find({name : storeCategory.name}).toArray()
    if(categoryExist.length !== 0) res.status(201).json({success : false , error: "storeCategory already exist"})
    else {
        storeCategorysColl.insertOne(storeCategory , function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        })
        res.status(201).json({success : true});
    }
}

exports.addDicStore = async (req, res) => {
    let dicStore = req.body.dicStore; 
    let categoryExist;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const dicStoresColl = await db.collection("dicStores"); // dicStores-collection name

    const storeCategorysColl = await db.collection("storeCategories");
    categoryExist = await storeCategorysColl.find({name : dicStore.categoryName}).toArray();

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
    
    let dicStoreExist = await dicStoresColl.find({name: dicStore.name}).toArray();
    if(dicStoreExist.length ===0){
        dicStoresColl.insertOne(dicStore , function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        })
        res.status(201).json({success : true});
    } else {
        res.status(201).json({success : false , error: "dicStore already exist"});
    }
    }

exports.addBranch = async (req, res) => {
    let branch = req.body.branch; 
    let storeExist;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const branchsColl = await db.collection("branches"); // branches-collection name
    
    const storesColl = await db.collection("dicStores");
    storeExist = await storesColl.find({name: branch.nameOfStore}).toArray();
    
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
   
    let branchExist = await branchsColl.find({name: branch.name , coords: branch.coords , StoreId : branch.StoreId}).toArray();
    if(branchExist.length === 0){
        branchsColl.insertOne(branch , function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        })
        res.status(201).json({success : true});
    } else {
        res.status(201).json({success : false , error: "branch already exist"});
    }
    } 

    exports.addDeal = async (req, res) => {
        let deal = req.body.deal; 
        let userFromCookie = req.authData
        const dbConnection = await connectToDatabase();
        const db = dbConnection.db;
        const dealsColl = await db.collection("deals"); // deals-collection name

        const dealTypesColl = await db.collection("dicDealTypes");
        let dealType = await dealTypesColl.find({name: deal.dealType}).toArray();

        if(dealType.length === 0) {
            res.status(201).json({success : false , error:"invalid dealType"});
            return;
        } 

        const categoriesColl = await db.collection("storeCategories");
        let category = await categoriesColl.find({name: deal.product}).toArray();

        if(category.length === 0) {
            res.status(201).json({success : false , error:"invalid category"});
            return;
        } 

        let newDeal = {
            dicDealTypes : dealType[0]._id ,
            userId : ObjectID(userFromCookie.userId) ,
            branch : deal.branch ,
            branchId : deal.branchId ,
            storeName : deal.storeName ,
            storeId : deal.storeId ,
            category : category[0]._id ,
            price : deal.price , 
            quantityGet : deal.quantityGet ,
            quantityPay : deal.quantityPay , 
            percent : deal.percent , 
            floor : deal.floor ,
            location:deal.location,
            imageIcon:deal.imageIcon,
            publishDate : new Date().getTime()
        }

        if(deal.yourWord !== "" && deal.yourWord !== undefined){
            newDeal.yourWord = deal.yourWord
        }

        dealsColl.insertOne(newDeal , function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        })
        res.status(201).json({success : true});
        } 
           
exports.getNames = async (req, res) => {
    let name = req.body.name; 
    let collection = req.body.collection;
    let list = []
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const dicStoresColl = await db.collection(collection);
    let listOfNames = await dicStoresColl.find({name : {$regex : name}}).toArray();
    for(let name of listOfNames){
        list.push(name.name)
    }
    res.status(201).json(list);
}
        
exports.addToSurvey = async (req, res) => {
    let answer = req.body.answer; 
    let deal = req.body.deal;
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const collenction = await db.collection("survey"); 
    let survey = {
        dealId: ObjectID(deal._id),
        answer : answer
    }
    collenction.insertOne(survey,function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
    })
   
    res.status(201).json({success:true});
}
        
