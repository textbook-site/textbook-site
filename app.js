// Template taken from https://github.com/passport/express-4.x-local-example and modified for my use
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./data');
var flash = require('connect-flash');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const hash = bcrypt.hashSync("plainTextPassword");

var books = require("./data/books");
var users = require("./data/users");

// books.addBook("European History Book", "John Smith", "978-2-10-495680-3",
//                  [
//                     {
//                         courseName: "European History",
//                         courseId: "59359",
//                         professor: "Professor Jackson"
//                     },
//                     {
//                         courseName: "European History II",
//                         courseId: "19581",
//                         professor: "Professor Washington"
//                     }
//                     ]);

let foo = books.getAllCourses().then((courseArray) => {
  console.log(courseArray);
})

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
        
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.getUserByUsername(username).then((user) => {
        bcrypt.compare(password, user.hashedPassword, (err, res) => {
            if (res != true) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }, (err) => {console.log(err); return cb(null, false);})
    .catch((err) => { console.log(err); return cb(null, false); });
      
    // db.users.getUserById(username, function(err, user) {
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
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  console.log("ID: " + id);
  // try {
  db.users.getUserById(id).then((user) => {
    cb(null, user);
  }).catch((err) => {
    return cb(err);
  });
});




// Create a new Express application.
var app = express();

app.engine('handlebars', handlebarsInstance.engine);
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));


app.use(flash());

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function(req, res) {
    var theBooks = books.getAllBooks().then((bookss) => {
        res.render('webPages/home', { books: bookss, user: req.user } );
    });
  });

app.get('/login',
  function(req, res){
    res.render('webPages/login', {error: req.flash('error'), title: "Login"});
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid username or password.' }),
  function(req, res) {
    res.redirect('/');
    // res.render('webPages/home', { user: req.user } );
    return;
  });

// app.get('/profile',
//   function(req, res){
//     res.render('webPages/userProfile', {user: req.user});
//   });

app.get('/register',
  function(req, res){
    res.render('login/register');
  });
  
app.post('/register',
  function(req, res) {
    var username = req.body.username;
    bcrypt.hash(req.body.password, 10).then((res) => {
      var password = res;
      var sessionId = ''; // TODO: Remove

      users.addUser(password, sessionId, username);
      res.render('login/register');
    }).catch((err) => { res.render('login/register', {error: err}); });
  });
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('webPages/userProfile', { user: req.user});
  });

app.post('/listBook', function(req, res) {
  // list book for sale
});

app.get('/search', function(req, res) {
  var allCourses;
  books.getAllCourses().then((courses) => {
    allCourses = courses;
    res.render('webPages/searchPage', {courses: allCourses});
  });
  // search by course, isbn, book name
});

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});