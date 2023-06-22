/* eslint-disable func-names */
/* eslint-disable object-shorthand */
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /https*:\/\/[a-zA-Z0-9\-\._~:\/?#\[\]@!$&'\(\)*\+,;=]+\.[a-zA-Z0-9\-\._~:\/?#\[\]@!$&'\(\)*\+,;=]+#*/.test(v);
      },
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
