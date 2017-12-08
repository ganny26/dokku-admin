const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appSchema = new Schema({
  name   : String,
  user   : String
});

module.exports = mongoose.model('App', appSchema);

