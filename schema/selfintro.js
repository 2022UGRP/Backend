const mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const selfintroSchema = new mongoose.Schema({
  User_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  Portfolio_id: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
  PortfolioNo: Number,
  SelfintroNo: Number,     //Selfintro를 나타내는 번호
  Title: String,           //어디에 합격한 자기소개서인지 표기
  Date: Date,
  Contents: String,
}, { versionKey: false, timestamps: true });

selfintroSchema.plugin(autoIncrement.plugin, {
  model: 'Selfintro',
  field: 'SelfintroNo',
  startAt: 10001,
  increment: 1,
})

module.exports = mongoose.model('Selfintro', selfintroSchema, 'Selfintro');