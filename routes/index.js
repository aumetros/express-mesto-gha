const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use('*', (req, res) => {
  res.send({ message: 'Страница не найдена.' }, 404);
});

module.exports = router;
