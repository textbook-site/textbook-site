const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;
const uuid = require('uuid');

function uniqueValues(courseId, courseArray) {
    if(courseId === '' || typeof(courseId) === 'undefined') {
        throw("You must pass a valid course ID");
    }
    else if(typeof(courseArray) === 'undefined') {
        throw("You must provide a valid list of courses");
    }
    for(let i = 0; i < courseArray.length; i++) {
        if(courseId === courseArray[i].courseId)
            return false;
    }
    return true;
}

let exportedMethods = {
    getAllBooks() {
        return books().then((bookCollection) => {
            return bookCollection.find({}).toArray();
            });
    },
    getBookById(id) {
        if(id === '' || typeof(id) === 'undefined') {
            throw("You must provide a valid id");
        }
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
        if(isbn === '' || typeof(id) === 'undefined') {
            throw("You must provide a valid isbn");
        }
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
        var isbnRe = new RegExp(/\d{1,3}\d\d{1,2}\d{1,5}\d/);

        if(author === '' || typeof(author) === 'undefined') {
            throw("You must provide a valid author");
        }
        else if(isbn === '' || typeof(isbn) === 'undefined') {
            throw("You must provide a valid isbn");
        }
        else if(!isbnRe.test(isbn)) {
            throw("You must provide an isbn in the format xxx-x-xx-xxxxx-x");
        }
        else if(typeof(courses) === 'undefined') {
            throw("You must provide a valid list of courses");
        }
        return books().then((bookCollection) => {
            let newBook = {
                _id: uuid.v4(),
                name: name,
                author: author,
                isbn: isbn,
                courses: []
                };
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
        if(id === '' || typeof(id) === 'undefined') {
            throw("You must provide a valid id");
        }
        return books().then((bookCollection) => {
            return bookCollection.removeOne({_id: id}).then((deletedInfo) => {
                if(deletedInfo.deletedCount === 0) {
                    throw("Could not find book with that id");
                }
            });
        });
    },
    updateBook(id, updatedBook) {
        if(id === '' || typeof(id) === 'undefined') {
            throw("You must provide a valid id");
        }
        else if(typeof(updatedBook) === 'undefined') {
            throw("You must provide a valid book to updated");
        }
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
        if(bookId === '' || typeof(bookId) === 'undefined') {
            throw("You must provide a valid book id");
        }
        else if(typeof(course) === 'undefined') {
            throw("You must provide a valid course");
        }
        else if(course.name === '' || typeof(course.name) === 'undefined') {
            throw("You must provide a valid course name");
        }
        else if(course.courseId === '' || typeof(course.courseId) === 'undefined') {
            throw("You must provide a valid course id");
        }
        else if(course.professor === '' || typeof(course.professor) === 'undefined') {
            throw("You must provide a valid professor for the course");
        }

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
    getAllCourses() {
        return this.getAllBooks().then((bookArray) => {
            let allCourses = []
            bookArray.forEach((element) => {
                if(element.courses.length != 0) {
                    for (var i=0; i< element.courses.length; i++) {
                        if (uniqueValues(element.courses[i].courseId, allCourses)) // Check that the course doesn't already exist in the list
                            allCourses.push(element.courses[i]);
                    }
                }
            });
            return allCourses;
        });
    },
    removeCourseFromBook(bookId, course) {
        if(bookId === '' || typeof(bookId) === 'undefined') {
            throw("You must provide a valid course id");
        }
        else if(typeof(course) === 'undefined') {
            throw("You must pass a valid course to remove");
        }
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