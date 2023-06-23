const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const {
  getUsers,
  getUser,
  updateUserInfo,
  updateUserAvatar,
  getCurrentUser,
} = require('../controllers/users');
const { linkReg } = require('../utils/constants');

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
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
    avatar: Joi.string().pattern(linkReg),
  }),
}), updateUserAvatar);

router.use(errors());

module.exports = router;
