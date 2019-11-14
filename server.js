const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const usersRouter = require('./users/user-router');

const server = express();

const middleware = [helmet(), express.json(), cors()]
server.use(middleware);
server.use('/api/users', usersRouter);

module.exports = server;