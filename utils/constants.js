const linkReg = /https*:\/\/[a-zA-Z0-9\-\._~:\/?#\[\]@!$&'\(\)*\+,;=]+\.[a-zA-Z0-9\-\._~:\/?#\[\]@!$&'\(\)*\+,;=]+#*/;

const invalidUserDataMsg = 'Переданы некорректные данные карточки.';
const cardNotFoundMsg = 'Карточка не найдена.';
const forbiddenErrorMsg = 'У вас нет прав на этой действие.';
const invalidCardDataMsg = 'Переданы некорректные данные пользователя.';
const userNotFoundMsg = 'Пользователь не найден.';
const invalidLoginData = 'Неправильные почта или пароль.';
const existEmailMsg = 'Пользователь с таким email уже зарегистрирован.';

module.exports = {
  linkReg,
  invalidUserDataMsg,
  cardNotFoundMsg,
  forbiddenErrorMsg,
  invalidCardDataMsg,
  userNotFoundMsg,
  invalidLoginData,
  existEmailMsg,
};
