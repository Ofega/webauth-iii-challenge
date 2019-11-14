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

const add = (user) => {
    return db('user').insert(user).then((ids) => getUser({ id: ids[0] }));
}

const update = (changes, id) => {
    return db('user').where({ id }).update(changes).then(() => getUser(id));
}

const remove = (id) => {
    return db('user').where({ id }).del();
}

module.exports = {
  getUsers,
  getUser,
  add,
  update,
  remove,
}