const mongoose = require('mongoose');
const Card = require('../models/card');

const ObjectID = mongoose.Types.ObjectId;
const invalidDataMsg = 'Переданы некорректные данные карточки.';
const cardNotFoundMsg = 'Карточка не найдена.';
const intServerErrorMsg = 'Внутренняя ошибка сервера.';
const forbiddenErrorMsg = 'У вас нет прав на этой действие.';

const BAD_REQUEST = 400;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const INT_SERVER_ERROR = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: invalidDataMsg });
      } else {
        res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const deleteCard = (req, res) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    return;
  }
  Card.findById(req.params.cardId)
    .orFail(() => new Error(cardNotFoundMsg))
    .then((card) => {
      if (card.owner === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((cardToDelete) => res.send({ data: cardToDelete }))
          .catch(() => {
            res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
          });
      } else {
        res.status(FORBIDDEN).send({ message: forbiddenErrorMsg });
      }
    })
    .catch((err) => {
      if (err.message === cardNotFoundMsg) {
        res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const likeCard = (req, res) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    return;
  }
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new Error(cardNotFoundMsg))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === cardNotFoundMsg) {
        res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const dislikeCard = (req, res) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    return;
  }
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new Error(cardNotFoundMsg))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === cardNotFoundMsg) {
        res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
