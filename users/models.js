const db = require('../data/db-config');


const getUsers = (filter) => {
    if (!filter) {
        return db('user');
    } else {
        return db('user').where(filter);
    }
}

const getUser = (filter) => {
    return db('user').where(filter).first();
}

module.exports = {
  getUsers,
  getUser
}