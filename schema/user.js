const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  Email: String,
  Password: String,
  Name: String,
  Phone: String,
  Age: String,
  School: String,
  Major: String,
  Portfolios: [
    {
      _id: false,
      Portfolio_id: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
      CreatedAt: { type: Date, required: true, default: () => Date.now() }
    }
  ],
  Requests: [
    {
      _id: false,
      State: Number,
      NFTtxHash: String,
      RequestAddress: String,
      User_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      CreatedAt: { type: Date, required: true, default: () => Date.now() }
    }
  ],
  Purchases: [
    {
      _id: false,
      State: Number,
      Portfolio_id: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio" },
      CreatedAt: { type: Date, required: true, default: () => Date.now() }
    }
  ]
}, { versionKey: false, timestamps: true });

module.exports = mongoose.model('User', userSchema, 'User');