const mongoose = require('mongoose');
const User = require('../models/user');

const ObjectID = mongoose.Types.ObjectId;
const invalidDataMsg = 'Переданы некорректные данные пользователя.';
const userNotFoundMsg = 'Пользователь не найден.';
const intServerErrorMsg = 'Внутренняя ошибка сервера.';

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => res.status(500).send({
      message: intServerErrorMsg,
      err: err.message,
      stack: err.stack,
    }));
};

const getUser = (req, res) => {
  if (!ObjectID.isValid(req.params.userId)) {
    res.status(400).send({ message: invalidDataMsg });
    return;
  }
  User.findById(req.params.userId)
    .orFail(() => new Error(userNotFoundMsg))
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.message === userNotFoundMsg) {
        res.status(404).send({ message: userNotFoundMsg });
      } else {
        res.status(500).send({ message: intServerErrorMsg });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: invalidDataMsg });
      } else {
        res.status(500).send({ message: intServerErrorMsg });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).send({ message: userNotFoundMsg });
      } else if (err.name === 'ValidationError') {
        res.status(400).send({ message: invalidDataMsg });
      } else {
        res.status(500).send({ message: intServerErrorMsg });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).send({ message: invalidDataMsg });
    return;
  }
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).send({ message: userNotFoundMsg });
      } else {
        res.status(500).send({ message: intServerErrorMsg });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
};
