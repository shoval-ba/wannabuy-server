const ObjectID = require('mongodb').ObjectId;
const connectToDatabase = require("../db").connectToDatabase;


exports.getStores = async (req, res) => {
  let storesList = []
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const storesColl = await db.collection("dicStores"); // dicStores-collection name
  const category = await storesColl.aggregate([
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryName'
      }
    }
  ]).toArray()
  const coll = await db.collection("branches"); // branches-collection name
  const stores2 = await coll.aggregate([
    {
      $lookup:
      {
        from: 'dicStores',
        localField: 'StoreId',
        foreignField: '_id',
        as: 'storeDetails'
      }
    }
  ]).toArray()

  for (let i = 0; i < stores2.length; i++) {
    let store = {
      name: stores2[i].name,
      coords: stores2[i].coords,
      floor: stores2[i].floor,
      storeName: JSON.stringify(stores2[i].storeDetails[0].name),
      category: category[0].categoryName[0].name
    }
    storesList.push(store)
  }

  res.status(201).json(storesList);
};

exports.getBranchesNear = async (req, res) => {
  let longitude = req.body.lon;
  let latitude = req.body.lat;

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  function getDistanceFromLatLonInKm(lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - latitude);  // deg2rad below
    var dLon = deg2rad(lon2 - longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(latitude)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }
  let storesList = []
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const storesColl = await db.collection("dicStores"); // dicStores-collection name
  const category = await storesColl.aggregate([
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryName'
      }
    }
  ]).toArray()
  const coll = await db.collection("branches"); // branches-collection name
  const stores2 = await coll.aggregate([
    {
      $lookup:
      {
        from: 'dicStores',
        localField: 'StoreId',
        foreignField: '_id',
        as: 'storeDetails'
      }
    }
  ]).toArray()

  for (let i = 0; i < stores2.length; i++) {
    let store = {
      name: stores2[i].name,
      coords: stores2[i].coords,
      floor: stores2[i].floor,
      storeName: JSON.stringify(stores2[i].storeDetails[0].name),
      storeLogo: JSON.stringify(stores2[i].storeDetails[0].logo),
      category: category[0].categoryName[0].name
    }
    let distance = getDistanceFromLatLonInKm(stores2[0].coords.lat, stores2[0].coords.lon);
    if (distance <= 90) storesList.push(store)
  }

  res.status(201).json(storesList);
};


exports.getUsers = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const coll = await db.collection("users"); // users-collection name
  let users = await coll.find({}).toArray()
  res.status(201).json(users);
};

exports.getMyUser = async (req, res) => {
  let authData = req.authData;
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const coll = await db.collection("users"); // users-collection name
  let user = await coll.find({ _id: ObjectID(authData.userId) }).toArray();
  res.status(201).json(user[0]);
};

exports.getCategories = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const coll = await db.collection("storeCategories"); // storeCategories-collection name
  let storeCategories = await coll.find({}).toArray()
  res.status(201).json(storeCategories);
};

exports.dicStores = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const storesColl = await db.collection("dicStores"); // dicStores-collection name
  let dicStoresList = []
  const dicStores = await storesColl.aggregate([
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'categoryName'
      }
    }
  ]).toArray()
  for (let i = 0; i < dicStores.length; i++) {
    let store = {
      id: dicStores[i]._id,
      name: dicStores[i].name,
      logo: dicStores[i].logo,
      category: dicStores[i].categoryName[0].name
    }
    dicStoresList.push(store)
  }
  res.status(201).json(dicStoresList);
};

exports.dicDealTypes = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const coll = await db.collection("dicDealTypes"); // dicDealTypes-collection name
  let dicDealTypes = await coll.find({}).toArray()
  res.status(201).json(dicDealTypes);
};

exports.getDeals = async (req, res) => {
  let authData = req.authData;
  let dealsList = [];
  let myDeals = [];
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const dealsColl = await db.collection("deals"); // deals-collection name
  let deals = await dealsColl.find({}).toArray();
  const dealType = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'dicDealTypes',
        localField: 'dicDealTypes',
        foreignField: '_id',
        as: 'dealType'
      }
    }
  ]).toArray();
  const category = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    }
  ]).toArray();
  const user = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    }
  ]).toArray()
  const branch = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'branches',
        localField: 'branchId',
        foreignField: '_id',
        as: 'branch'
      }
    }
  ]).toArray()
  const coll = await db.collection("branches"); // branches-collection name
  const stores2 = await coll.aggregate([
    {
      $lookup:
      {
        from: 'dicStores',
        localField: 'StoreId',
        foreignField: '_id',
        as: 'storeDetails'
      }
    }
  ]).toArray()
  for (let i = 0; i < deals.length; i++) {
    let storeName;
    for (let store of stores2) {
      if (JSON.stringify(branch[i].branch[0].StoreId) == JSON.stringify(store.storeDetails[0]._id)) {
        storeName = store.storeDetails[0].name
      }
    }
    let deal = {
      publishDate: deals[i].publishDate,
      price: deals[i].price,
      quantityGet: deals[i].quantityGet,
      quantityPay: deals[i].quantityPay,
      percent: deals[i].percent,
      branchName: branch[i].branch[0].name,
      floor: branch[i].branch[0].floor,
      dealType: JSON.stringify(dealType[i].dealType[0].name),
      category: category[i].category[0].name,
      userPhone: user[i].user[0].phone,
      userName: user[i].user[0].name,
      storeName: storeName
    }

    if (authData !== undefined) {
      if (user[i].user[0]._id.equals(authData.userId)) myDeals.push(deal);
      else dealsList.push(deal);
    }
    else dealsList.push(deal)
  }
  res.status(201).json({ dealsList, myDeals });
};

exports.getDealsNear = async (req, res) => {
  let authData = req.authData;

  let longitude = req.body.lon;
  let latitude = req.body.lat;

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  function getDistanceFromLatLonInKm(lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - latitude);  // deg2rad below
    var dLon = deg2rad(lon2 - longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(latitude)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  let dealsList = [];
  let myDeals = [];
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const dealsColl = await db.collection("deals"); // deals-collection name
  let deals = await dealsColl.find({}).toArray();
  const dealType = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'dicDealTypes',
        localField: 'dicDealTypes',
        foreignField: '_id',
        as: 'dealType'
      }
    }
  ]).toArray();
  const category = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    }
  ]).toArray();
  const user = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    }
  ]).toArray()
  const branch = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'branches',
        localField: 'branchId',
        foreignField: '_id',
        as: 'branch'
      }
    }
  ]).toArray()
  const coll = await db.collection("branches"); // branches-collection name
  const stores2 = await coll.aggregate([
    {
      $lookup:
      {
        from: 'dicStores',
        localField: 'StoreId',
        foreignField: '_id',
        as: 'storeDetails'
      }
    }
  ]).toArray()
  for (let i = 0; i < deals.length; i++) {
    let storeName;
    for (let store of stores2) {
      if (JSON.stringify(branch[i].branch[0].StoreId) == JSON.stringify(store.storeDetails[0]._id)) {
        storeName = store.storeDetails[0].name
      }
    }
    let deal = {
      publishDate: deals[i].publishDate,
      price: deals[i].price,
      quantityGet: deals[i].quantityGet,
      quantityPay: deals[i].quantityPay,
      percent: deals[i].percent,
      branchName: branch[i].branch[0].name,
      floor: branch[i].branch[0].floor,
      dealType: JSON.stringify(dealType[i].dealType[0].name),
      category: category[i].category[0].name,
      userPhone: user[i].user[0].phone,
      userName: user[i].user[0].name,
      storeName: storeName
    }

    let distance = getDistanceFromLatLonInKm(branch[i].branch[0].coords.lat, branch[i].branch[0].coords.lon);
    if (distance <= 90) {
      if (authData !== undefined) {
        if (user[i].user[0]._id.equals(authData.userId)) myDeals.push(deal);
        else dealsList.push(deal);
      }
      else dealsList.push(deal)
    }
  }
  res.status(201).json({ dealsList, myDeals });
};


exports.getDeal = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const dealsColl = await db.collection("deals"); // deals-collection name
  const deals = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'dicDealTypes',
        localField: 'dicDealTypes',
        foreignField: '_id',
        as: 'dealType'
      }
    } , {$unwind: '$dealType'} ,
    {
      $lookup:
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    } , {$unwind: '$user'} ,
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    } , {$unwind: '$category'} ,
    { $match: { _id: ObjectID(req.body.dealId) }} ,
    {
      $project: {
        dicDealTypes : 0 ,
        userId :0 ,
        category :0
      }
    }
  ]).toArray();
  res.send(deals[0])
}

exports.getChats = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const chatsColl = await db.collection("chats");
  const chats = await chatsColl.aggregate([
    {
      $lookup:
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $match: { dealId: ObjectID(req.body.dealId)}},
    {$unwind: '$user'} ,
    {$sort : {orderTime:1} } ,
    {
      $project :{
        userId :0 ,
        "user.jwtToken" :0
      }
    }
  ]).toArray();
  res.send(chats)
}