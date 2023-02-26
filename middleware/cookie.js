const { ACCESS_TOKEN_SECRET } = process.env;
const jwt = require('jsonwebtoken');

exports.verifyToken = (req , res, next) => {
   const cookie = req.cookies.user;
   if(!cookie) return res.json({success:false})
   jwt.verify(cookie.jwtToken, ACCESS_TOKEN_SECRET, (err, authData) => {
    if (err) {
        res.json({
            success: false,
            message: "wrong token",
        });
    } else {
        req.authData = authData
        next();
    }
    })
}

exports.verifyTokenToDeals = (req , res, next) => {
    const cookie = req.cookies.user;
    if(!cookie) {
        next();
        return;
    }
    jwt.verify(cookie.jwtToken, ACCESS_TOKEN_SECRET, (err, authData) => {
     if (err) {
         res.json({
             success: false,
             message: "wrong token",
            });
     } else {
         req.authData = authData
         next();
     }
     })
 }

exports.createToken = (userId , phoneNumber) => {
    return jwt.sign( {userId :userId , phoneNumber : phoneNumber}, ACCESS_TOKEN_SECRET , {expiresIn: '182d'});
};

exports.verifyUserByToken = (req , res, next) => {
    const token = req.body.token;
    if(!token) return res.json({success:false})
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, authData) => {
     if (err) {
         res.json({
             success: false,
             message: "wrong token",
         });
     } else {
         req.authData = authData;
         next();
     }
     })
 }
 
 exports.verifyUserToDeals = (req , res, next) => {
    const token = req.body.token;
    if(!token) {
        next();
        return;
    }
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, authData) => {
     if (err) {
         res.json({
             success: false,
             message: "wrong token",
            });
     } else {
         req.authData = authData
         next();
     }
     })
 }