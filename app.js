// Template taken from https://github.com/passport/express-4.x-local-example and modified for my use
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./data');
var flash = require('connect-flash');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const Cookies = require("cookies");
const hash = bcrypt.hashSync("plainTextPassword");
const static = express.static(__dirname + '/public');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: "user_profile_images/" });

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

// let foo = books.getAllCourses().then((courseArray) => {
//   console.log(courseArray);
// })


const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        asJSON: (obj, spacing) => {
            if (typeof spacing === "number")
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
        
            return new Handlebars.SafeString(JSON.stringify(obj));
        },
        select: (selected, options) => { // code taken from http://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
          return options.fn(this).replace(
              new RegExp(' value=\"' + selected + '\"'),
              '$& selected="selected"');
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
  // console.log("ID: " + id);
  // try {
  db.users.getUserById(id).then((user) => {
    cb(null, user);
  }).catch((err) => {
    return cb(err);
  });
});




// Create a new Express application.
var app = express();
// app.use(express.static('public'))
app.use(static);
app.use(express.static(__dirname + '/user_profile_images'));
app.engine('handlebars', handlebarsInstance.engine);
// Configure view engine to render handlebars templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// in order to store user profile images


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

app.get('/books/:id',
  function(req, res) {
    var theBooks = books.getBookById(req.params.id).then((thisBook) => {
      var prices = [];
      users.getAllUsers().then((t_users) => {
        for (let user in t_users) {
          var thisUser = t_users[user];
          for (let userBook in thisUser.profile.books) {
            var targetBook = thisUser.profile.books[userBook];
            if (thisBook.isbn === targetBook.isbn) {
              prices.push({sellerId: thisUser._id, sellerUsername: thisUser.username, condition: targetBook.condition, price: targetBook.price, sellerBookId: targetBook._id});
            }
          }
        }
      });
      res.render('webPages/singlebook', { books: thisBook, user: req.user, prices: prices } );
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

app.get('/register',
  function(req, res){
    res.render('webPages/register');
  });

  
app.post('/register',
  function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    users.addUser(username,password,name).then((a) => {
      res.redirect('/login');
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
    books.getAllBooks().then((allBooks) => {
      for (let userBook in req.user.profile.books) {
        for (let _books in allBooks) {
          if (req.user.profile.books[userBook].isbn == allBooks[_books].isbn) {
              req.user.profile.books[userBook].name = allBooks[_books].name;
              req.user.profile.books[userBook].author = allBooks[_books].author;
              req.user.profile.books[userBook].bookID = allBooks[_books]._id;
          }
        }
      } 
      res.render('webPages/userProfile', { user: req.user });
    });
  });

app.get('/addBook',  
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    books.getAllBooks().then((allBooks) => { 
      res.render('webPages/addBook', { user: req.user, books: allBooks});
    });
});

app.post('/addBook',  
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    if (req.body.isbn === undefined || req.body.isbn == "" || req.body.condition === undefined || req.body.condition == "" || req.body.price === undefined || req.body.price == "" ) {
      res.render('webPages/addBook', { user: req.user, error: "Please fill in all the book information", isbn: req.body.isbn, condition: req.body.condition, price: req.body.price});
      return;
    } else {
      let bookToAdd = {isbn: req.body.isbn, condition: req.body.condition, price: req.body.price };
      users.addBookToUser(req.user._id, bookToAdd).then((i) => {
        res.redirect('/profile');
      }).catch((err) => {
        res.render('webPages/addBook', { user: req.user, error: err, isbn: req.body.isbn, condition: req.body.condition, price: req.body.price});
      });
    }
  });

app.get('/editBook/:id',  
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var bookID = req.params.id;
    var userBooks = req.user.profile.books;
    var bookToEdit = undefined;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToEdit = userBooks[i];
    }
    if (bookToEdit === undefined)
      res.redirect('/');
    else {
      // Add book information to the book for the user
      books.getAllBooks().then((allBooks) => {
        for (let _books in allBooks) {
          if (bookToEdit.isbn == allBooks[_books].isbn) {
              bookToEdit.name = allBooks[_books].name;
              bookToEdit.author = allBooks[_books].author;
              bookToEdit.bookID = allBooks[_books]._id;
          }
        }
        res.render('webPages/editBook', { user: req.user, book: bookToEdit});
      });
    }
});
app.post('/editBook',  
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var bookID = req.body.userBookID;
    var condition = req.body.condition;
    var price = req.body.price;
    var userBooks = req.user.profile.books;
    if (bookID === undefined || bookID == "" || condition === undefined || condition == "" || price === undefined || price == "") {
      res.redirect('/profile', {error: "An error has occurred while updating your book. Please ensure all values are populated when updating a book"});
      return;
    }
    var bookToEdit;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToEdit = userBooks[i];
    }
    if (bookToEdit === undefined) 
      res.redirect('/profile', {error: "An unexpected error has occurred while updating your book. Please try again."});

    users.removeBookFromUser(req.user._id, bookToEdit).then((t) => {
      bookToEdit.condition = condition;
      bookToEdit.price = price;
      users.addBookToUser(req.user._id, bookToEdit).then((x) => {
        res.redirect('/profile');
      });
    }).catch((err) => { res.redirect('/profile', {error: "An unexpected error has occurred while updating your book. Please try again."}); });
});
app.post('/deleteBook',  
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var bookID = req.body.userBookID;
    var userBooks = req.user.profile.books;
    if (bookID === undefined || bookID == "") {
      res.redirect('/profile', {error: "An unexpected error has occurred while updating your book. Please try again."});
      return;
    }
    var bookToDelete;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToDelete = userBooks[i];
    }
    if (bookToDelete === undefined) 
      res.redirect('/profile', {error: "An unexpected error has occurred while updating your book. Please try again."});

    users.removeBookFromUser(req.user._id, bookToDelete).then((t) => {
      res.redirect('/profile');
    }).catch((err) => { res.redirect('/profile', {error: "An unexpected error has occurred while updating your book. Please try again."}); });
});
app.get('/search', function(req, res) {
  var allCourses;
  books.getAllCourses().then((courses) => {
    allCourses = courses;
    res.render('webPages/searchPage', {user: req.user, courses: allCourses});
  });
});

app.post('/search', function(req, res) {
  var allCourses;
  books.getAllCourses().then((courses) => {
    allCourses = courses;
    if (req.body.Course === undefined || req.body.Course == "") {
      res.render('webPages/searchPage', {user: req.user, courses: allCourses, error: "You must provide a course"});
      return;
    }
    books.getAllBooks().then((allBooks) => {
      var booksForCourse = [];
      for (var i in allBooks) {
        for (var y in allBooks[i].courses) {
          if (req.body.Course == allBooks[i].courses[y]._id) {
            booksForCourse.push(allBooks[i]);
          }
        }
      }
      res.render('webPages/searchPage', {courses: allCourses, books: booksForCourse });
    }).catch((err) => { res.render('webPages/searchPage', {courses: allCourses, error: err}); });
  });
});
app.get('/cart',
  function(req, res){
    _cookies = new Cookies(req, res);
    var cart = _cookies.get("shoppingCart");
    if (cart === undefined)
      cart = "";
    else
      cart = JSON.parse(cart);
    res.render('webPages/purchase', {user: req.user, books: cart});
  });
app.get('/addToCart/:sellerId/:bookId',
  function(req, res){
    _cookies = new Cookies(req, res);
    var book;
    var jsonRes;
    users.getUserById(req.params.sellerId).then((user) => {
      for (var i in user.profile.books) {
        let thisBook = user.profile.books[i];
        if (thisBook._id == req.params.bookId) {
          thisBook.sellerId = req.params.sellerId;
          let cart = _cookies.get("shoppingCart");
          if (cart === undefined || cart == "")
            cart = [];
          else
            cart = JSON.parse(cart);
          cart.push(thisBook);
          _cookies.set("shoppingCart", JSON.stringify(cart), { httpOnly: false });
          jsonRes = {status: 0};
        }
      }
      if (jsonRes === undefined) {
        jsonRes = {status: 500, description: "An unknown error has occurred."}
      }
      res.json(jsonRes);
    });
  });
app.get('/removeFromCart/:bookId',
  function(req, res){
    _cookies = new Cookies(req, res);
    var book;
    var jsonRes;
    let cart = _cookies.get("shoppingCart");
    if (cart === undefined || cart == "")
      cart = [];
    else
      cart = JSON.parse(cart);
    for (var i in cart) {
      let thisBook = cart[i];
      if (thisBook._id == req.params.bookId) {
        cart.splice(i, 1);
        _cookies.set("shoppingCart", JSON.stringify(cart), { httpOnly: false });
        jsonRes = {status: 0};
      }
    }
    if (jsonRes === undefined) {
      jsonRes = {status: 500, description: "An unknown error has occurred."}
    }
    res.json(jsonRes);
  });

app.post('/upload', upload.single('file'), function(req,res, next) {
  let userProfilePath = req.user._id + ".jpg"
  fs.rename( "./user_profile_images/" + req.file.filename, "./user_profile_images/" + userProfilePath,
    function(err) {
      if(err) {
        res.send(err);
      }
      req.user.profile.profileImage = userProfilePath;
        users.updateUser(req.user._id, req.user).then((updatedUser) => {
          books.getAllBooks().then((allBooks) => {
            for (let userBook in req.user.profile.books) {
              for (let _books in allBooks) {
                if (req.user.profile.books[userBook].isbn == allBooks[_books].isbn) {
                    req.user.profile.books[userBook].name = allBooks[_books].name;
                    req.user.profile.books[userBook].author = allBooks[_books].author;
                    req.user.profile.books[userBook].bookID = allBooks[_books]._id;
                }
              }
            }
            res.redirect('/profile');
        });
      });
  });
});
app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});