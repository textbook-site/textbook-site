const userRoutes = require('./users');
const bookRoutes = require('./books');

const constructorMethod = (app) => {
    app.use('/user', userRoutes);
    app.use('/books', bookRoutes);
};

module.exports = {
    users: require('./users'),
    books: require('./books')
};
