const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ObjectID = mongoose.Types.ObjectId;

const { BadRequestError, NotFoundError, ExistEmailError } = require('../utils/errors');

const invalidDataMsg = 'Переданы некорректные данные пользователя.';
const userNotFoundMsg = 'Пользователь не найден.';
// const intServerErrorMsg = 'Внутренняя ошибка сервера.';
const invalidLoginData = 'Неправильные почта или пароль.';
const existEmailMsg = 'Пользователь с таким email уже зарегистрирован.';

// const BAD_REQUEST = 400;
// const NOT_FOUND = 404;
// const INT_SERVER_ERROR = 500;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUser = (req, res, next) => {
  if (!ObjectID.isValid(req.params.userId)) {
    throw new BadRequestError(invalidDataMsg);
  }
  User.findById(req.params.userId)
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: userNotFoundMsg });
      } else {
        next();
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new BadRequestError(invalidDataMsg);
  }

  if (validator.isEmail(email)) {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((user) => res.status(201).send({ data: user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(invalidDataMsg));
          // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
        } else if (err.code === 11000) {
          next(new ExistEmailError(existEmailMsg));
        } else {
          next();
          // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
        }
      });
  } else {
    next(new BadRequestError(invalidDataMsg));
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
  }
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  if (!ObjectID.isValid(req.user._id)) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
  }
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: userNotFoundMsg });
      } else if (err.name === 'ValidationError') {
        next(new NotFoundError(userNotFoundMsg));
        // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (!ObjectID.isValid(req.user._id) || !avatar) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
  }
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: userNotFoundMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const getCurrentUser = (req, res, next) => {
  if (!ObjectID.isValid(req.user._id)) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
  }
  User.findById(req.user._id)
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: userNotFoundMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError(invalidDataMsg);
  }

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new BadRequestError(invalidLoginData);
      }
      bcrypt.compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((matched) => {
          if (matched) {
            const token = jwt.sign(
              { _id: user._id },
              'secret-key',
              { expiresIn: '7d' },
            );
            res.cookie('jwt', token, {
              maxAge: 3600000,
              httpOnly: true,
            })
              .end();
          } else {
            throw new BadRequestError(invalidLoginData);
            // return Promise.reject(new Error(invalidLoginData));
          }
        })
        .catch(() => {
          next(new BadRequestError(invalidLoginData));
          // res.status(UNAUTHORIZED).send({ message: invalidLoginData });
        });
    })
    .catch(() => {
      next(new BadRequestError(invalidLoginData));
      // res.status(UNAUTHORIZED).send({ message: invalidLoginData });
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
  getCurrentUser,
};
