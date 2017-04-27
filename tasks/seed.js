const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;
const books = data.books;

dbConnection().then(db => {
    return db.dropDatabase().then(() => {
        return dbConnection;
    }).then((db) => {
        return users.addUser("mpszonka", "apple", "Michael");
    }).then(() => {
        return users.addUser("wacosta", "orange", "Wilber");
    }).then(() => {
        return users.addUser("tduo', pear", "Tom");
    }).then(() => {
        return users.addUser("tsmith", "banana", "Tim");
    }).then(() => {
        return users.addUser("mbarry", "blueberry", "Melissa");
    }).then(() => {
        return users.addUser("mlong", "rasberry", "Megan");
    }).then(() => {
        let user = users.getUserByUsername("wacosta").then((u) => {
            let bookInfo = { isbn: "978-2-12-345680-3", price: "1.00", condition: "new" }
            return users.addBookToUser(u._id, bookInfo);
        });
    }).then(() => {
        return books
            .addBook("American History Book", "Jack Black", "978-2-12-345680-3", [])
            .then(() => {
                return books.addBook("European History Book", "John Smith", "978-2-10-495680-3",
                 [
                    {
                        courseName: "European History",
                        courseId: "59359",
                        professor: "Professor Jackson"
                    },
                    {
                        courseName: "European History II",
                        courseId: "19581",
                        professor: "Professor Washington"
                    }
                    ]);
            })
            .then(() => {
                return books.addBook("Algebra", "Kanye West", "849-2-32-34590-3", 
                [
                    {
                        courseName: "Algebra I",
                        courseId: "19491",
                        professor: "Professor Newton"
                    },
                    {
                        courseName: "Algebra II",
                        courseId: "6991",
                        professor: "Professor Gauss"
                    }
                ]);
            })
            .then(() => {
                return books.addBook("Geography", "Kendrick Lamar", "123-4-32-45590-3", []);
            })
            .then(() => {
                return books.addBook("Biology", "Isaac Watson", "543-3-62-34660-8", 
                [
                    {
                        courseName: "Biology I",
                        courseId: "49518",
                        professor: "Professor Crick"   
                    } 
                ]);
            })
            .then(() => { 
                return books.addBook("Calculus", "Jane Doe", "439-7-82-54790-2", 
                [
                    {
                        courseName: "Calculus I",
                        courseId: "95181",
                        professor: "Professor Archimedes"   
                    }
                ]);
            });
        });
        db.close();
    }, (error) => {
        console.error(error);
    }).then(() => {
        console.log("Done seeding database");
    });
