const env = process.argv[2] || "prod";

require("custom-env").env(env);
const serverless = require('serverless-http');

const http = process.env === "prod" ? require("https") : require("http");
const app = require("./app");

const port = process.env.PORT || 3000;
console.log(`listening port ${port} base url ${process.env.API_BASE_URL}`);

const server = http.createServer(app);

const io = require('socket.io')(server, {
  allowRequest: (req, callback) => {
    callback(null, true); // only allow requests without 'origin' header
  } ,
  cors_allowed_origins : "*" ,
  cors: {
      origin: "*"
  } ,
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
});

io.on('connection', (socket) => {
    socket.on('room', async function(room , message) {
      socket.join(room);
      // console.log(message)
      io.sockets.in(room).emit('message', message);
    });
    
    socket.on('deals',  function(addNewDeal , location) {
      console.log(location)
      io.emit('addNewDeal', {
        addNewDeal: addNewDeal,
         location : location
      });
    });
});


server.listen(port);
