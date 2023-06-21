const mongoose = require('mongoose');
const Card = require('../models/card');

const ObjectID = mongoose.Types.ObjectId;

const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const invalidDataMsg = 'Переданы некорректные данные карточки.';
const cardNotFoundMsg = 'Карточка не найдена.';
const forbiddenErrorMsg = 'У вас нет прав на этой действие.';

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
      } else {
        next();
      }
    });
};

const deleteCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
  }
  Card.findById(req.params.cardId)
    .orFail(() => new Error(cardNotFoundMsg))
    .then((card) => {
      if (card.owner.equals(req.user._id)) {
        card.deleteOne();
        return res.send(card);
      }
      throw new ForbiddenError(forbiddenErrorMsg);
    })
    .catch((err) => {
      if (err.message === cardNotFoundMsg) {
        next(new NotFoundError(cardNotFoundMsg));
      } else {
        next();
      }
    });
};

const likeCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
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
      } else {
        next();
      }
    });
};

const dislikeCard = (req, res, next) => {
  if (!ObjectID.isValid(req.params.cardId)) {
    throw new BadRequestError(invalidDataMsg);
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
      } else {
        next();
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
