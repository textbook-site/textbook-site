const mongoCollection = require('../config/mongoCollections');
const users = mongoCollection.users;
const books = require("../data/books")
const uuid = require('uuid');
const bcrpyt = require('bcrypt-nodejs');


let exportedMethods = {

    getAllUsers() {
        return users().then((userCollection) => {
            return userCollection.find({}).toArray();
        });
    },
    getUserById(id) {
        if(id === "" || typeof(id) === 'undefined') {
            throw("Invalid id provided");
        }
        return users().then((userCollection) =>{
            return userCollection.findOne({_id: id}).then((user) => {
                if(!user) {
                    throw "Sorry, user not found";
                }
                return user;
            });
        });
    },
    getUserByUsername(username) {
        if(username === '' || typeof(username) === 'undefined') {
            throw("You have passed an invalid username");
        }
        return users().then((userCollection) => {
            return userCollection.findOne({username: username}).then((user) => {
            if(!user) {
                throw "Sorry, could not find user with that username";
            }
            return user;
            });
        });
    },
    addUser(username, password, name, profileImage = "") {
        if(username === '' || typeof(username) === 'undefined') {
            throw("Username invalid");
        }
        else if(password === '' || typeof(password) === 'undefined') {
            throw('You must provide a valid password');
        }
        else if(name === '' || typeof(name) === 'undefined') {
            throw("You must provide a valid name");
        }
        return users().then((userCollection) => {
            return userCollection.findOne({username: username}).then((user) => {
                if(user) {
                    throw (`The username ${username} is already in use`);
                }
                bcrpyt.hash(password, null, null, (err, hash) => {
                    let newUser = {
                        _id: uuid.v4(),
                        username: username,
                        hashedPassword: hash,
                        profile: {
                            name: name,
                            books: [],
                            profileImage: profileImage
                            },
                    };
                    return userCollection.insertOne(newUser).then((insertedInfo) => {
                        return insertedInfo.insertedId;
                    }).then((newId) => {
                        return this.getUserById(newId);
                    });
                });
            });
        });
    },
    removeUser(id) {
        if(id === '' || typeof(id) === 'undefined') {
            throw("You must provide a valid id");
        }
        return users().then((userCollection) => {
            return userCollection.removeOne({_id: id}).then((deletedInfo) => {
                if(deletedInfo.deletedCount === 0) {
                    throw("Could not find user with that id");
                }
            });
        });
    },
    updateUser(id, updatedUser) {
        if(id === '' || typeof(id) === 'undefined') {
            throw('You must provide a valid id');
        }
        else if(typeof(updatedUser) === 'undefined') {
            throw("You must pass a user object");
        }
        return users().then((userCollection) => {
            if(typeof(updatedUser.profile.name) === "") {
                throw("You must provide a valid name");
            }
            return userCollection.findOne({_id: id}).then((user) => {
                let updatedUserData = {
                    profile: {
                        name: updatedUser.profile.name,
                        profileImage: updatedUser.profile.profileImage,
                        books: updatedUser.profile.books
                    }
                }

                let updateCommand = {
                    $set: updatedUserData
                };

                return userCollection.updateOne({_id: id}, updateCommand).then(()=> {
                    return this.getUserById(id);
                });
            });
        });
    },
    addBookToUser(userId, bookInfo) {
        var isbnRe = new RegExp(/\d{1,3}\d\d{1,2}\d{1,5}\d/);
        if(userId === '' || typeof(userId) === 'undefined') {
            throw("Your must pass a valid userId");
        }
        else if(typeof(bookInfo) === 'undefined') {
            throw("You must provide a valid book")
        }
        else if(bookInfo.isbn === '' || typeof(bookInfo.isbn) === 'undefined') {
            throw("You must provide an isbn");
        }
        else if(!isbnRe.test(bookInfo.isbn)) {
            throw("You must provide an isbn in the format xxx-x-xx-xxxxx-x");
        }
        else if(bookInfo.condition === '' || typeof(bookInfo.isbn) === 'undefined') {
            throw("You must provide a valid condition");
        }
        else if(isNaN(bookInfo.price) || typeof(bookInfo.isbn) === 'undefined') {
            throw("You must provide a valid price");
        }
        return users().then((userCollection) => {
            userCollection.updateOne({_id: userId}, {
                $push: {
                    "profile.books": {
                        _id: uuid.v4(),
                        isbn: bookInfo.isbn,
                        condition: bookInfo.condition,
                        price: bookInfo.price
                    }
                }
            }); 
        })

    },
    removeBookFromUser(userId, book) {
        if(userId === '' || typeof(userId) === 'undefined') {
            throw("You must provide a valid username");
        }
        else if(typeof(book) === 'undefined') {
            throw("You must provide a valid book to remove");
        }
        return users().then((userCollection) => {
            return userCollection.updateOne({_id: userId}, {
                $pull: {
                    "profile.books": {
                        _id: book._id
                    }
                }
            });
        }); 
    }
}

module.exports = exportedMethods;
