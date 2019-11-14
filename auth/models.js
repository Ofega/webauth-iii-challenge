const db = require('../data/db-config');


const getUser = (filter) => {
    return db('user').where(filter).first();
}

const add = (user) => {
    return db('user').insert(user).then((ids) => getUser({ id: ids[0] }));
}

module.exports = {
    add,
    getUser,
}