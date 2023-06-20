const mongoose = require('mongoose');
const Card = require('../models/card');

const ObjectID = mongoose.Types.ObjectId;

const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const invalidDataMsg = 'Переданы некорректные данные карточки.';
const cardNotFoundMsg = 'Карточка не найдена.';
// const intServerErrorMsg = 'Внутренняя ошибка сервера.';
const forbiddenErrorMsg = 'У вас нет прав на этой действие.';

// const BAD_REQUEST = 400;
// const FORBIDDEN = 403;
// const NOT_FOUND = 404;
// const INT_SERVER_ERROR = 500;

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(invalidDataMsg));
        // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const deleteCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
  }
  Card.findById(req.params.cardId)
    .orFail(() => new Error(cardNotFoundMsg))
    .then((card) => {
      if (card.owner === req.user._id) {
        Card.findByIdAndRemove(card._id)
          .then((cardToDelete) => res.send({ data: cardToDelete }))
          .catch(next);
      } else {
        throw new ForbiddenError(forbiddenErrorMsg);
        // res.status(FORBIDDEN).send({ message: forbiddenErrorMsg });
      }
    })
    .catch((err) => {
      if (err.message === cardNotFoundMsg) {
        next(new NotFoundError(cardNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const likeCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
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
        next(new NotFoundError(cardNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
      }
    });
};

const dislikeCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
    // res.status(BAD_REQUEST).send({ message: invalidDataMsg });
    // return;
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
        next(new NotFoundError(cardNotFoundMsg));
        // res.status(NOT_FOUND).send({ message: cardNotFoundMsg });
      } else {
        next();
        // res.status(INT_SERVER_ERROR).send({ message: intServerErrorMsg });
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
