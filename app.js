const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const static = express.static(__dirname + '/public');
const data = require('./data');
const users = data.users;


app.use('/public', static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());




app.listen(3000, () => {
    console.log("Listening on port 3000...");
});

