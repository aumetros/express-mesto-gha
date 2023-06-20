const errorHandler = (err, req, res, next) => {
  res.status(500).send({ message: 'Что-то не так!' });
  next();
};

module.exports = errorHandler;
