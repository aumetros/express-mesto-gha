const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const {
  getUsers,
  getUser,
  updateUserInfo,
  updateUserAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object({
    avatar: Joi.string().pattern(/https*:\/\/[a-zA-Z0-9\-\._~:\/?#\[\]@!$&'\(\)*\+,;=]+#*/),
  }),
}), updateUserAvatar);

router.use(errors());

module.exports = router;
