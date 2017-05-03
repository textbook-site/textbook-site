var passport = require('passport');
var Strategy = require('passport-local').Strategy;
const data = require('../data'); 
const bcrypt = require("bcrypt-nodejs");
var flash = require('connect-flash');


module.exports = (passport, Strategy) => {
    // Configure the local strategy for use by Passport.
    //
    // The local strategy require a `verify` function which receives the credentials
    // (`username` and `password`) submitted by the user.  The function must verify
    // that the password is correct and then invoke `cb` with a user object, which
    // will be set at `req.user` in route handlers after authentication.
    passport.use(new Strategy(
    function (username, password, cb) {
        data.users.getUserByUsername(username).then((user) => {
        bcrypt.compare(password, user.hashedPassword, (err, res) => {
            if (res != true) {
            return cb(null, false);
            }
            return cb(null, user);
        });
        }, (err) => { console.log(err); return cb(null, false); })
        .catch((err) => { console.log(err); return cb(null, false); });

        // data.users.getUserById(username, function(err, user) {
        //   if (err) { return cb(err); }
        //   if (!user) { return cb(null, false); }

        //   bcrypt.compare(password, user.hashedPassword, (err, res) => {
        //     if (res != true) {
        //       return cb(null, false);
        //     }
        //     return cb(null, user);
        //   });
        // }).catch((err) => { return cb(null, false); });
    }));


    // Configure Passport authenticated session persistence.
    //
    // In order to restore authentication state across HTTP requests, Passport needs
    // to serialize users into and deserialize users out of the session.  The
    // typical implementation of this is as simple as supplying the user ID when
    // serializing, and querying the user record by ID from the database when
    // deserializing.
    passport.serializeUser(function (user, cb) {
    cb(null, user._id);
    });

    passport.deserializeUser(function (id, cb) {
    // console.log("ID: " + id);
    // try {
    data.users.getUserById(id).then((user) => {
        cb(null, user);
    }).catch((err) => {
        return cb(err);
    });
    });
}