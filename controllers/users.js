const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ObjectID = mongoose.Types.ObjectId;

const {
  BadRequestError,
  NotFoundError,
  ExistEmailError,
  AuthorizationError,
} = require('../utils/errors');
const {
  invalidUserDataMsg,
  userNotFoundMsg,
  invalidLoginData,
  existEmailMsg,
} = require('../utils/constants');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

const getUser = (req, res, next) => {
  if (!ObjectID.isValid(req.params.userId)) {
    throw new BadRequestError(invalidUserDataMsg);
  }
  User.findById(req.params.userId)
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
      } else {
        next();
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (validator.isEmail(email)) {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((user) => res.status(201).send({ data: user.toJSON() }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(invalidUserDataMsg));
        } else if (err.code === 11000) {
          next(new ExistEmailError(existEmailMsg));
        } else {
          next();
        }
      });
  } else {
    next(new BadRequestError(invalidUserDataMsg));
  }
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  if (!ObjectID.isValid(req.user._id)) {
    throw new BadRequestError(invalidUserDataMsg);
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
      } else if (err.name === 'ValidationError') {
        next(new NotFoundError(userNotFoundMsg));
      } else {
        next();
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (!ObjectID.isValid(req.user._id) || !avatar) {
    throw new BadRequestError(invalidUserDataMsg);
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
      } else {
        next();
      }
    });
};

const getCurrentUser = (req, res, next) => {
  if (!ObjectID.isValid(req.user._id)) {
    throw new BadRequestError(invalidUserDataMsg);
  }
  User.findById(req.user._id)
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        next(new NotFoundError(userNotFoundMsg));
      } else {
        next();
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

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
            res.send({ token });
          } else {
            throw new BadRequestError(invalidLoginData);
          }
        })
        .catch(() => {
          next(new BadRequestError(invalidLoginData));
        });
    })
    .catch(() => {
      next(new AuthorizationError(invalidLoginData));
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
