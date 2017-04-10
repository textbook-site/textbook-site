const mongoCollection = require('../config/mongoCollections');
const users = mongoCollection.users;
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
    addUser(password, sessionId, profile) {
        return users().then((userCollection) => {
            bcrpyt.hash(password, null, null, (err, hash) => {
                let newUser = {
                    _id: uuid.v4(),
                    hashedPassword: hash,
                    sessionId: sessionId,
                    profile: {
                        name: profile.name,
                        books: profile.books,
                        profileImage: profile.profileImage
                    }
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
                        name: updatedUser.profile.name,
                    }
                };

                let updateCommand = {
                    $set: updatedUserData
                };

                return userCollection.updateOne({_id: id}, updateCommand).then(()=> {
                    return this.getUserById(id);
                });
            });
        });
    },
    addBookToUser(userId, book) {
        return users().then((userCollection) => {
            return userCollection.updateOne({_id: userId}, {
                $push: {
                    books: {
                       isbn: book.isbn,
                       condition: book.condition,
                       price: book.price 
                    }
                }
            });
        });
    },
    removeBookFromUser(userId, book) {
        return users().then((userCollection) => {
            return userCollection.updateOne({_id: userId}, {
                $pull: {
                    books: {
                        isbn: book.isbn
                    }
                }
            });
        }); 
    }
}

module.exports = exportedMethods;