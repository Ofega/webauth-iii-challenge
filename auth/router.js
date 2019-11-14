const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./models');

const router = express.Router();

router.post('/register', validateUserBody, (req, res, next) => {
  const { username, password, department } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 11);

  db.add({ username, password: hashedPassword, department }).then(user => {
    res.status(201).json('New user created');
  }).catch(next);
});

router.post('/login', validateUserLogin, (req, res, next) => {
  const { username, password } = req.body;

  db.getUser({ username }).then(user => {
    if (!user) {
      next({ message: "Invalid credentials", status: 401 });
    } else {
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        next({ message: "Invalid credentials", status: 401 });
      } else {
        const token = generateToken(user);
        res.status(200).json({ token });
      }
    }
  }).catch(next);
});

function validateUserBody(req, res, next) {
  const { username, password, department } = req.body;
  if (!username || !password || !department) {
    next({ message: 'Missing one of the required `username`, `password` or `department` fields!', status: 401 });
  } else {
    req.body = { username, password, department };
    next();
  }
}

function validateUserLogin(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    next({ message: 'Missing one of the required `username` or `password` fields!', status: 401 });
  } else {
    req.body = { username, password };
    next();
  }
}

function generateToken(user) {
  return jwt.sign(
    {
      subject: user.id,
      username: user.username,
      department: user.department
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  );
}

router.use((error, req, res) => {
  res.status(error.status || 500).json({
    file: './auth/router',
    method: req.method,
    url: req.url,
    status: error.status || 500,
    message: error.message
  }).end();
})

module.exports = router;