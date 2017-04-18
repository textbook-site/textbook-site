const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;
const uuid = require('uuid');

let exportedMethods = {
    getAllBooks() {
        return books().then((bookCollection) => {
            return bookCollection.find({}).toArray();
            });
    },
    getBookById(id) {
        return books().then((bookCollection) => {
            return bookCollection.findOne({_id: id}).then((book) => {
                if(!book) {
                    throw("Could not find book with that id");
                }
                return book;
            });
        });
    },
    getBookByIsbn(isbn) {
        return books().then((bookCollection) => {
            return bookCollection.findOne({isbn: isbn}).then((book) => {
                if(!book) {
                  throw("Could not find book with that isbn");  
                }
                return book;
            });
        });
    },
    addBook(name, author, isbn, courses) {
        return books().then((bookCollection) => {
            let newBook = {
                _id: uuid.v4(),
                name: name,
                author: author,
                isbn: isbn,
                courses: []
                }
            newBook.courses = courses.map((element) => {
                return newCourse = {
                        _id: uuid.v4(),
                        courseName: element.courseName,
                        courseId: element.courseId,
                        professor: element.professor
                    }
                });    
            bookCollection.insertOne(newBook).then((insertedInfo) => {
                return insertedInfo.insertedId;
            }).then((newId) => {
                return this.getBookById(newId);
            });
        });
    },
    removeBook(id) {
        return books().then((bookCollection) => {
            return bookCollection.removeOne({_id: id}).then((deletedInfo) => {
                if(deletedInfo.deletedCount === 0) {
                    throw("Could not find book with that id");
                }
            });
        });
    },
    updateBook(id, updatedBook) {
        return books.then((bookCollection) => {
            return bookCollection.findOne({_id: id}).then((book) => {
                let updatedBookData = {
                    name: updatedBook.name,
                    author: updatedBook.author,
                    isbn: updatedBook.isbn
                };

                let updateCommand = {
                    $set: updatedBookData
                };

                return bookCollection.updateOne({_id: id}, updateCommand).then(() =>{
                    return this.getBookById(id);
                });
            });
        });
    },
    addCourseToBook(bookId, course) {
        return books().then((bookCollection) => {
            return bookCollection.updateOne({_id: bookId},{
                $push: {
                    courses: {
                        name: course.name,
                        courseId: course.courseId,
                        professor: course.professor
                    }
                }
            });
        });
    },
    removeCourseFromBook(bookId, course) {
        return books().then((bookCollection) => {
            return bookCollection.removeOne({_id: id},{
                $pull: {
                    courses: {
                        courseId: course.courseId
                    }
                }
            });
        });
    }
}


module.exports = exportedMethods;