const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./models');

const router = express.Router();


router.get('/', restricted, (req, res, next) => {
  db.getUsers({ department: req.loggedInUser.department }).then(users => {
    if (users) {
      res.status(200).json(users.map(user => ({ id: user.id, username: user.username })));
    } else {
      next({ message: "No users were found", status: 404 });
    }
  }).catch(next);
})

router.get('/:id', restricted, validateUserId, (req, res) => {
  res.status(200).json(req.user);
})

function validateUserId(req, res, next) {
  const { id } = req.params;
  let validId = Number(id);
  if (!Number.isInteger(validId) && validId > 0) {
    next({ message: 'Invalid user id' })
  }
  db.getUser({ id: validId }).then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      next({ message: 'Could not find user with given id', status: 404 });
    }
  }).catch(next);
}

function restricted(req, res, next) {
  const token = req.headers.authorization;
  const secret = process.env.JWT_SECRET;
  if (token) {
    jwt.verify(token, secret, (err, decodedUser) => {
      if (err) {
        next({ message: err, status: 400 });
      } else {
        req.loggedInUser = decodedUser;
        next();
      }
    });
  } else {
    next({ message: "Please login to access this route", status: 401 });
  }
}

router.use((error, req, res) => {
  res.status(error.status || 500).json({
    file: 'router',
    method: req.method,
    url: req.url,
    status: error.status || 500,
    message: error.message
  }).end();
})


module.exports = router;