const handleErrors = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибканям'
        : message,
    });
  next();
};

module.exports = handleErrors;
