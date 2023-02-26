
var axios = require('axios');
const getDataByLocationController = require("../controllers/getDataByLocation.ctrl");
const connectToDatabase = require("../db").connectToDatabase;

let mallName = ""

exports.getCategories = async (req, res) => {
  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const coll = await db.collection("storeCategories"); // storeCategories-collection name
  let storeCategories = await coll.find({}).toArray()
  res.status(201).json(storeCategories);
};

exports.getMall = async (req, res) => {
  let lon = req.body.lon;
  let lat = req.body.lat;
  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=200&type=shopping_mall&key=AIzaSyCE0BloagJCbZudr4q64fyv8OY59Aclh_g`,
    headers: {}
  };
  axios(config)
    .then(function (response) {
      if (response.data.results.length === 0) {
        res.json("No malls around you")
      }
      else {
        mallName = response.data.results[0].name;
        mallName = mallName.replace(/['"]+/g, '');
        res.send({ mallName: mallName, mallId: response.data.results[0].place_id })
      }
    })
    .catch(function (error) {
      console.log("no");
    });
}

exports.getStores = async (req, res) => {
  let stores = [];
  let lon = req.body.lon;
  let lat = req.body.lat;
  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=500&type=store&key=AIzaSyCE0BloagJCbZudr4q64fyv8OY59Aclh_g`,
    headers: {}
  };
  axios(config)
    .then(function (response) {
      // res.send(JSON.stringify(response.data.results[0]))
      const npt = JSON.stringify(response.data.next_page_token);
      for (let store of response.data.results) {
        let store1 = {
          name: store.name,
          placeId: store.place_id,
          rating: store.rating,
          icon: store.icon,
          location: {
            lat: store.geometry.location.lat,
            lon: store.geometry.location.lng
          }
        }
        stores.push(store1)
      }
      if (npt) {
        setTimeout(() => {
          getNextPage(npt, lat, lon)
        }, 1000)
      }
      else {
        res.send({ stores: stores })
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  function getNextPage(nptInput, lat, lon) {
    nptInput = nptInput.replace(/['"]+/g, '');
    var config = {
      method: 'get',
      url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lon}&radius=300&type=store&pagetoken=${nptInput}&key=AIzaSyCE0BloagJCbZudr4q64fyv8OY59Aclh_g`,
      headers: {}
    };
    axios(config)
      .then(function (response) {
        const npt = JSON.stringify(response.data.next_page_token);
        for (let store of response.data.results) {
          let store1 = {
            name: store.name,
            placeId: store.place_id,
            rating: store.rating,
            icon: store.icon,
          }
          stores.push(store1);
        }

        if (npt) {
          setTimeout(() => {
            getNextPage(npt, lat, lon)
          }, 1500)
        } else {
          res.send({ stores: stores, mallName: mallName })
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

}

exports.getStoresAutocomplete = async (req, res) => {
  let value = req.body.value
  // AutoComplete by search
  let lon = 31.925291;
  let lat = 34.8635115;
  var config = {
    method: 'get',
    url: `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${value}&type=store&location=${lat}%2C${lon}&radius=300&strictbounds=true&key=AIzaSyCE0BloagJCbZudr4q64fyv8OY59Aclh_g`,
    headers: {}
  };

  axios(config)
    .then(function (response) {
      res.send(JSON.stringify(response.data))
    })
    .catch(function (error) {
      console.log(error);
    });
}

exports.getDealsInMall = async (req, res) => {
  let mall = req.body.mall;
  let location = req.body.location;
  let authData = req.authData;
  let dealsList = [];
  let myDeals = [];
  function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344
      return dist;
    }
  }


  const dbConnection = await connectToDatabase();
  const db = dbConnection.db;
  const dealsColl = await db.collection("deals"); // deals-collection name
  // let deals = await dealsColl.find({}).toArray();
  const deals = await dealsColl.aggregate([
    {
      $lookup:
      {
        from: 'dicDealTypes',
        localField: 'dicDealTypes',
        foreignField: '_id',
        as: 'dealType'
      }
    }, { $unwind: '$dealType' },
    {
      $lookup:
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    }, { $unwind: '$user' },
    {
      $lookup:
      {
        from: 'storeCategories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryName'
      }
    }, { $unwind: '$categoryName' },
    {
      $project: {
        dicDealTypes: 0,
        userId: 0,
        category: 0
      }
    }
  ]).toArray();
  //  console.log(deals)
  for (let i = 0; i < deals.length; i++) {
    if (authData !== undefined) {
      if (deals[i].user._id.equals(authData.userId)) myDeals.push(deals[i]);
    }
    else if (mall) {
      if (deals[i].branch == mall && authData == undefined ) {
        dealsList.push(deals[i])
      }
    } 
    else if (distance(location.latitude, location.longitude, deals[i].location.lat, deals[i].location.lon) < 0.5 && authData == undefined) {
        dealsList.push(deals[i])
      }
  }
  res.status(201).json({ dealsList, myDeals });
}