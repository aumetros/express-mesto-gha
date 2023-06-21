const jwt = require('jsonwebtoken');
const { AuthorizationError } = require('../utils/errors');

const handleAuthError = () => {
  throw new AuthorizationError('Необходима авторизация');
  // res.status(401).send({ message: 'Необходима авторизация' });
};

// const extractBearerToken = (header) => header.replace('Bearer ', '');

// eslint-disable-next-line consistent-return
const auth = (req, res, next) => {
  // const { authorization } = req.headers;

  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   return handleAuthError();
  // }

  // const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDkzMTgzODMyOTRkNjI3NzNiZjZhMTkiLCJpYXQiOjE2ODczNjE2MjgsImV4cCI6MTY4Nzk2NjQyOH0.Mm1ZuXrzBv7mVEvhWB1fkM-nz57Q_2Msk2LTd5SOqb4', 'secret-key');
  } catch (err) {
    return handleAuthError();
  }

  req.user = payload;

  next();
};

module.exports = auth;
