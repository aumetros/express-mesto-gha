const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '647cd7e47ecd7f2951feaca7',
  };

  next();
});

app.use(router);
// app.use('/cards', require('./routes/cards'));

// app.use('*', (req, res) => {
//   res.send({ message: 'Страница не найдена.' }, 404);
// });

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Сервер запущен на порту 3000');
});
