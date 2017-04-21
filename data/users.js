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
        return users().then((userCollection) =>{
            userCollection.findOne({_id: id}).then((user) => {
                if(!user) {
                    throw "Sorry, user not found";
                }
                return user;
            });
        });
    },
    getUserByUsername(username) {
        return users().then((userCollection) => {
            if(!user) {
                throw "Sorry, could not find user with that username";
            }
            return user;
        });
    },
    addUser(username, password, name, profileImage = "") {
    getUserByName(name) {
        return users().then((userCollection) =>{
            userCollection.findOne({'profile.name': name}).then((user) => {
                if(user === undefined || !user) {
                    throw "Sorry, user not found";
                }
                return user;
            });
        });
    },
    addUser(password, name, profileImage = "") {
        return users().then((userCollection) => {
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
    },
    removeUser(id) {
        return users().then((userCollection) => {
            return usercollection.removeOne({_id: id}).then((deletedInfo) => {
                if(deletedInfo.deletedCount === 0) {
                    throw("Could not find user with that id");
                }
            });
        });
    },
    updateUser(id, updatedUser) {
        return users().then((userCollection) => {
            return userCollection.findOne({_id: id}).then((user) => {
                let updatedUserData = {
                    profile: {
                        name: updatedUser.name,
                        profileImage: updatedUser.profileImage
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
        return users().then((userCollection) => {
            userCollection.updateOne({_id: userId}, {
                $push: {
                    "profile.books": {
                        isbn: bookInfo.isbn,
                        condition: bookInfo.condition,
                        price: bookInfo.price
                    }
                }
            }); 
        })

    },
    removeBookFromUser(userId, book) {
        return users().then((userCollection) => {
            return userCollection.updateOne({_id: userId}, {
                $pull: {
                    inventory: {
                        isbn: book.isbn
                    }
                }
            });
        }); 
    }
}

module.exports = exportedMethods;
