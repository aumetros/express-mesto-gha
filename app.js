const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');
const errorHandler = require('./middlewares/errors');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.use(router);

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен на порту 3000');
});
