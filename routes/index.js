const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const auth = require('../middlewares/auth');
const { login, createUser } = require('../controllers/users');

router.post('/signin', login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.use(auth);

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use('*', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена.' });
});

router.use(errors());

module.exports = router;
