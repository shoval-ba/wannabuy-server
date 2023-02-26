const connectToDatabase = require("../db").connectToDatabase;


exports.getBranchesNames = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
 
  let input = req.body.input; 
  let storeName = req.body.storeName; 
  let list = [];

  const dicStoresColl = await db.collection("dicStores"); // dicStores-collection name
  let store = await dicStoresColl.find({name : storeName }).toArray();
  const branchesColl = await db.collection("branches"); // dicStores-collection name
  if(store.length === 0){
    let listOfNames = await branchesColl.find({name : {$regex : input} }).toArray();
    for(let name of listOfNames){
        list.push(name.name)
    }
    res.status(201).json(list);
    return
  } else {
      let listOfNames = await branchesColl.find({name : {$regex : input} ,  StoreId : store[0]._id}).toArray();
      for(let name of listOfNames){
          list.push(name.name)
      }
      res.status(201).json(list);
  }
};

exports.getDicStoresNames = async (req, res) => {
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
   
    let input = req.body.input; 
    let branch = req.body.branch; 
    let list = [];
  
    const branchesColl = await db.collection("branches"); // branches-collection name
    let branchExist = await branchesColl.find({name : branch }).toArray();
    const dicStoresColl = await db.collection("dicStores"); // dicStores-collection name

    if(branchExist.length === 0){
      let listOfNames = await dicStoresColl.find({name : {$regex : input} }).toArray();
      for(let name of listOfNames){
          list.push(name.name)
      }
      res.status(201).json(list);
    } else {
        for(let branch of branchExist){
            let listOfNames = await dicStoresColl.find({name : {$regex : input} ,  _id : branch.StoreId}).toArray();
            for(let name of listOfNames){
                list.push(name.name)
            }
        }
        res.status(201).json(list);
    }
};

exports.getFloor = async (req, res) => {
    console.log("get floor")
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
   
    let storeName = req.body.storeName; 
    let branch = req.body.branch; 
  
    const dicStoresColl = await db.collection("dicStores"); // dicStores-collection name
    let store = await dicStoresColl.find({name : storeName }).toArray();
    if(store.length === 0) {
        res.status(201).json("");
    } else {
        const branchesColl = await db.collection("branches"); // branches-collection name
        let branchExist = await branchesColl.find({name : branch , StoreId : store[0]._id}).toArray();
        if(branchExist.length === 0 ) res.status(201).json("");
        else res.status(201).json(branchExist[0].floor);
    }
};
