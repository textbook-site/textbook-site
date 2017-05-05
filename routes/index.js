const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const fs = require('fs');
const books = require('../data/books');
const users = require('../data/users');
const multer = require('multer');
const upload = multer({ dest: "./user_profile_images/" });
const Cookies = require("cookies");
const bcrypt = require("bcrypt-nodejs");
const hash = bcrypt.hashSync("plainTextPassword");
const path = require('path');



require('../passport-config/passport-strats.js')(passport, Strategy);

const constructorMethod = (app) => {
// Define routes.
app.get('/',
  function (req, res) {
    var theBooks = books.getAllBooks().then((bookss) => {
      res.status(200).render('webPages/home', { books: bookss, user: req.user });
    });
  });

app.get('/books/:id',
  function (req, res) {
    var theBooks = books.getBookById(req.params.id).then((thisBook) => {
      var prices = [];
      users.getAllUsers().then((t_users) => {
        for (let user in t_users) {
          var thisUser = t_users[user];
          for (let userBook in thisUser.profile.books) {
            var targetBook = thisUser.profile.books[userBook];
            if (thisBook.isbn === targetBook.isbn) {
              prices.push({ sellerId: thisUser._id, sellerUsername: thisUser.username, condition: targetBook.condition, price: targetBook.price, sellerBookId: targetBook._id });
            }
          }
        }
      });
      res.status(200).render('webPages/singlebook', { books: thisBook, user: req.user, prices: prices });
    });
  });
app.get('/login',
  function (req, res) {
    var registration = req.query.registration;
    res.status(200).render('webPages/login', { error: req.flash('error'), registration: registration });
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Invalid username or password.' }),
  function (req, res) {
    res.redirect('/');
    // res.render('webPages/home', { user: req.user } );
    return;
  });

app.get('/register',
  function (req, res) {
    res.status(200).render('webPages/register');
  });


app.post('/register',
  function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    users.addUser(username, password, name).then((a) => {
      res.status(200).redirect('/login?registration=true');
    }).catch((err) => { res.status(401).render('webPages/register', { error: err, username: username, name: name }); });
  });
app.get('/logout',
  function (req, res) {
    req.logout();
    res.status(200).redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
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
      res.status(200).render('webPages/userProfile', { user: req.user });
    });
  });

app.get('/addBook',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    books.getAllBooks().then((allBooks) => {
      res.status(200).render('webPages/addBook', { user: req.user, books: allBooks });
    });
  });

app.post('/addBook',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var price = parseInt(req.body.price);
    if (req.body.isbn === undefined || req.body.isbn == "" || req.body.condition === undefined || req.body.condition == "" || req.body.price === undefined || req.body.price == "") {
      books.getAllBooks().then((allBooks) => {
        res.render('webPages/addBook', { user: req.user, error: "Please fill in all the book information", isbn: req.body.isbn, condition: req.body.condition, price: req.body.price, books: allBooks });
        return;
      });
    } else if (typeof price !== "number") {
      books.getAllBooks().then((allBooks) => {
        console.log(typeof req.body.price);
        res.render('webPages/addBook', { user: req.user, error: "Please provide a number for the price of the book", isbn: req.body.isbn, condition: req.body.condition, price: req.body.price, books: allBooks });
        return;
      });
    } else {
      price = price.toFixed(2);
      let bookToAdd = { isbn: req.body.isbn, condition: req.body.condition, price: price };
      users.addBookToUser(req.user._id, bookToAdd).then((i) => {
        res.status(200).redirect('/profile');
      }).catch((err) => {
        res.status(404).render('webPages/addBook', { user: req.user, error: err, isbn: req.body.isbn, condition: req.body.condition, price: req.body.price });
      });
    }
  });

app.get('/editBook/:id',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var bookID = req.params.id;
    var userBooks = req.user.profile.books;
    var bookToEdit = undefined;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToEdit = userBooks[i];
    }
    if (bookToEdit === undefined)
      res.status(200).redirect('/');
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
        res.status(200).render('webPages/editBook', { user: req.user, book: bookToEdit });
      });
    }
  });
app.post('/editBook',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var bookID = req.body.userBookID;
    var condition = req.body.condition;
    var price = req.body.price;
    var userBooks = req.user.profile.books;
    if (bookID === undefined || bookID == "" || condition === undefined || condition == "" || price === undefined || price == "") {
      res.status(404).redirect('/profile', { error: "An error has occurred while updating your book. Please ensure all values are populated when updating a book" });
      return;
    }
    var bookToEdit;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToEdit = userBooks[i];
    }
    if (bookToEdit === undefined)
      res.status(404).redirect('/profile', { error: "An unexpected error has occurred while updating your book. Please try again." });

    users.removeBookFromUser(req.user._id, bookToEdit).then((t) => {
      bookToEdit.condition = condition;
      bookToEdit.price = price;
      users.addBookToUser(req.user._id, bookToEdit).then((x) => {
        res.status(200).redirect('/profile');
      });
    }).catch((err) => { res.redirect('/profile', { error: "An unexpected error has occurred while updating your book. Please try again." }); });
  });
app.post('/deleteBook',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    var bookID = req.body.userBookID;
    var userBooks = req.user.profile.books;
    if (bookID === undefined || bookID == "") {
      res.status(404).redirect('/profile', { error: "An unexpected error has occurred while updating your book. Please try again." });
      return;
    }
    var bookToDelete;
    for (let i in userBooks) {
      if (userBooks[i]._id == bookID)
        bookToDelete = userBooks[i];
    }
    if (bookToDelete === undefined)
      res.status(404).redirect('/profile', { error: "An unexpected error has occurred while updating your book. Please try again." });

    users.removeBookFromUser(req.user._id, bookToDelete).then((t) => {
      res.status(200).redirect('/profile');
    }).catch((err) => { res.status(404).redirect('/profile', { error: "An unexpected error has occurred while updating your book. Please try again." }); });
  });
app.get('/search', function (req, res) {
  var allCourses;
  books.getAllCourses().then((courses) => {
    allCourses = courses;
    res.status(200).render('webPages/searchPage', { user: req.user, courses: allCourses });
  });
});

app.post('/search', function (req, res) {
  var allCourses;
  books.getAllCourses().then((courses) => {
    allCourses = courses;
    if (req.body.Course === undefined || req.body.Course == "") {
      res.status(200).render('webPages/searchPage', { user: req.user, courses: allCourses, error: "You must provide a course" });
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
      res.status(200).render('webPages/searchPage', {  user: req.user,courses: allCourses, books: booksForCourse });
    }).catch((err) => { res.status(404).render('webPages/searchPage', {  user: req.user, courses: allCourses, error: err }); });
  });
});
app.get('/cart', require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    _cookies = new Cookies(req, res);
    var cart = _cookies.get("shoppingCart");
    if (cart === undefined)
      cart = "";
    else
      cart = JSON.parse(cart);
    res.status(200).render('webPages/cart', { user: req.user, books: cart });
  });
app.get('/addToCart/:sellerId/:bookId', require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
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
          else {
            cart = JSON.parse(cart);
          }
          // Check if this item is already in the cart, if it is disallow it
          var itemAlreadyInCart = false;
          for (var y in cart) {
            if (cart[y]._id == req.params.bookId) {
              itemAlreadyInCart = true;
            }
          }
          if (!itemAlreadyInCart) {
            cart.push(thisBook);
            _cookies.set("shoppingCart", JSON.stringify(cart), { httpOnly: false });
            jsonRes = { status: 0 };
          } else {
            jsonRes = { status: 482 };
          }
        }
      }
      if (jsonRes === undefined) {
        jsonRes = { status: 500, description: "An unknown error has occurred." }
      }
      res.json(JSON.stringify(jsonRes));
    });
  });
app.get('/removeFromCart/:bookId',
  function (req, res) {
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
        jsonRes = { status: 0 };
      }
    }
    if (jsonRes === undefined) {
      jsonRes = { status: 500, description: "An unknown error has occurred." }
    }
    res.json(JSON.stringify(jsonRes));
  });


app.get('/paymentInformation',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.status(200).render("./webPages/paymentInformation", { user: req.user });
  });

app.post('/purchaseItems',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    //do things to remove items in cart from database
    _cookies = new Cookies(req, res);
    let cart = _cookies.get("shoppingCart");
    if (cart === undefined || cart == "")
      cart = [];
    else
      cart = JSON.parse(cart);
    for (var i in cart) {
      let thisBook = cart[i];
      users.removeBookFromUser(thisBook.sellerId, thisBook).then((i) => {
        // _cookies.set("shoppingCart", JSON.stringify("[]"), { httpOnly: false });
        res.clearCookie("shoppingCart");
        res.status(200).render("./webPages/purchaseSuccess", { user: req.user });
      }).catch((err) => {
        res.status(404).render("./webPages/purchaseSuccess", { user: req.user, error: err });
      });
    }
  });


app.post('/upload', require('connect-ensure-login').ensureLoggedIn(), upload.single('file'), function (req, res, next) {
  let userProfilePath = req.user._id + ".jpg"
  fs.rename("./user_profile_images/" + req.file.filename, "./user_profile_images/" + userProfilePath,
    function (err) {
      if (err) {
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
          res.status(200).redirect('/profile');
        });
      });
    });
});
app.get('/userImage/:id',
  function (req, res) {
    let userProfilePath = req.params.id + ".jpg"
    res.status(200).sendfile("./user_profile_images/" + userProfilePath);
  });
// app.get('/userImage/:id', function (req,res)


app.use('*', function(req, res) {
  res.status(404).render('./webPages/404');
})

}
module.exports = constructorMethod;
