const mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(mongoose.connection);

const portfolioSchema = new mongoose.Schema({
  User_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  CopyrightHolderName: String,      //최초 저작권자 이름
  State: Number,                    //1일시 기본, 2일시 NFT 발급 상태
  Elements: [                       //포트폴리오 구성요소
    {
      Element_id: { type: mongoose.Schema.Types.ObjectId, ref: "Element" },
      Activity: String,
      Contents: String,
    }
  ],
  Selfintros: [                     //자기소개서
    {
      Element_id: { type: mongoose.Schema.Types.ObjectId, ref: "Selfintro" },
      Title: String,
      Date: Date,              //합격날짜or작성날짜
      Contents: String,
    }
  ],

  Image: String,
  NFTtitle: String,
  NFTdesciription: String,
  NFTprice: Number,
  NFTownerAddress: String,        // owner의 metamask 지갑 주소
  NFTownerName: String,           // owner의 이름 ex) 이영진
  NFTtxHash: String,
}, { versionKey: false, timestamps: true });

portfolioSchema.plugin(autoIncrement.plugin, {
  model: 'Portfolio',
  field: 'PortfolioNo',
  startAt: 10001,
  increment: 1,
})

module.exports = mongoose.model('Portfolio', portfolioSchema, 'Portfolio');

// Diagnosis: [
//     {
//       _id: false,
//       Section: Number,
//       ZScore: Number,
//       CreatedAt: { type: Date, required: true, default: () => Date.now() } 
//     }
//   ],
