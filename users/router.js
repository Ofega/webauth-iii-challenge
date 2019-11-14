const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./models');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('<h1>Hello world</h1>');
});

router.post('/register', validateUserBody, (req, res, next) => {
  const { username, password, department } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 11);
  db.add({ username, password: hashedPassword, department }).then(user => {
    res.status(201).json({ id: user.id, username: user.username, department });
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

router.get('/users', restricted, (req, res, next) => {
  db.getdb({ department: req.loggedInUser.department }).then(users => {
    if (users) {
      res.status(200).json(users.map(user => ({ id: user.id, username: user.username })));
    } else {
      next({ message: "No users were found", status: 404 });
    }
  }).catch(next);
});

router.get('/users/:id', restricted, validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.put('/users/:id', validateUserId, validateUserBody, (req, res, next) => {
  db.update(req.body, req.user.id).then(updatedScheme => {
    res.status(200).json(updatedScheme);
  }).catch(next);
});

router.delete('/users/:id', validateUserId, (req, res, next) => {
  db.remove(req.user.id).then(() => {
    res.status(204).json(req.user);
  }).catch(next);
});

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

function restricted(req, res, next) {
  const token = req.headers.authorization;
  const secret = (process.env.NODE_ENV === 'development' ? 'secret' : process.env.JWT_SECRET);
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
    next({ message: "YOU SHALL NOT PASS!", status: 401 });
  }
}

router.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    file: 'user-router',
    //headers: req.headers,
    //protocol: req.protocol,
    method: req.method,
    url: req.url,
    status: error.status || 500,
    message: error.message
  }).end();
})

function generateToken(user) {
  return jwt.sign(
    {
      subject: user.id,
      username: user.username,
      department: user.department
    },
    (process.env.NODE_ENV === 'development' ? 'secret' : process.env.JWT_SECRET),
    {
      expiresIn: '1d',
    }
  );
}

module.exports = router;