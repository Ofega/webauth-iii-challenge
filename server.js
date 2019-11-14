const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const usersRouter = require('./users/router');
const authRouter = require('./auth/router');

const server = express();

const middleware = [helmet(), express.json(), cors()]
server.use(middleware);
server.use('/api/users', usersRouter);
server.use('/api/auth', authRouter);

module.exports = server;