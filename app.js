// Template taken from https://github.com/passport/express-4.x-local-example and modified for my use
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var flash = require('connect-flash');
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');

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



// Create a new Express application.
var app = express();
// app.use(express.static('public'))
app.use(static);
//app.use(express.static(__dirname + '/user_profile_images'));
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

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});