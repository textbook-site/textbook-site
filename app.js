const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const static = express.static(__dirname + '/public');
const data = require('./data');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const users = data.users;  // will be removed in production, only to seed db
const books = data.books;  // ditto

const handlebarInstance = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        asJSON: (obj, spacing) => {
            if(typeof spacing == 'number') 
                return new Handlebars.SafeString(JSON.stringify(obj, null, spacing))

            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});


app.use('/public', static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.engine('handlebars', handlebarInstance.engine);
app.set('view engine', 'handlebars');

/*run npm start with this 
code once, to have some 
data in database
*/

// users.addUser("thispasswordwillbehashed",
//              "John Smith", "profileImage");
             

             

// books.addBook("Alexander Hamilton", "Alexander Churnhow", "123456", [{
//     courseName: "History",
//     courseId: "1234",
//     professor: "Professor Smith"
// }]);

// books.addBook("Calculus", "Ron Larson", "78910", [{
//     courseName: "Calculus 1",
//     courseId: "5678",
//     professor: "Professor Doe"
//     },
//     {
//     courseName: "Calculus 2",
//     courseId: "59359",
//     professor: "Professor Jackson"
//     }
// ]);


app.listen(3000, () => {
    console.log("Listening on port 3000...");
});

