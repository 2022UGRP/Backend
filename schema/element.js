const mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const elementSchema = new mongoose.Schema({
  User_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  Portfolio_id: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
  PortfolioNo: Number,
  ElementNo: Number,     //Element를 나타내는 번호
  Activity: String,      //활동
  Contents: String,      //내용
}, { versionKey: false, timestamps: true });

elementSchema.plugin(autoIncrement.plugin, {
  model: 'Element',
  field: 'ElementNo',
  startAt: 10001,
  increment: 1,
})

module.exports = mongoose.model('Element', elementSchema, 'Element');