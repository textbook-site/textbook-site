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
            return userCollection.findOne({_id: id}).then((user) => {
                if(!user) {
                    throw "Sorry, user not found";
                }
                return user;
            });
        });
    },
    getUserByUsername(username) {
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
        return users().then((userCollection) => {
            return userCollection.removeOne({_id: id}).then((deletedInfo) => {
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
