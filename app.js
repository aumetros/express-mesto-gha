const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.use('/users', userRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер слушает порт 3000');
});
