var express = require('express');
var router = express.Router();
const Portfolio = require('../schema/portfolio');
const User = require('../schema/user');

/*portfolio 생성*/
router.post('/:loginKey/:Name', function (req, res, next) {
  const { loginKey } = req.params;
  const { Name } = req.params;
  User.findOne({ User_id: loginKey }, function(err, user){
    const portfolio = new Portfolio({
      User_id: loginKey,
      CopyrightHolderName: Name,
      State: 1,
    });
    console.log(portfolio);
    Portfolio.create(portfolio, (e, p) =>{
      User.findOneAndUpdate(
        { User_id: loginKey },
        { $push: { Portfolios: { Portfolio_id: p._id } } },
        function (err,) {
          if (err) throw err;
          res.send({ message: 'first portfolio made', Id: p._id });
        }
      );
    });
  });
});

// /*NFT 발행(portfolio 수정)*/
// router.get('/NFT/:portfoliokey', function (req, res, next) {
//     const { portfoliokey } = req.params;
//     User.findOne({ Portfolio_id: portfoliokey }, function(err, user){
//         const portfolio = new Portfolio({
//             User_id: loginKey,
//             State: 1,
//         });
//         console.log(portfolio);
//         portfolio.save(function(error){
//             User.findOneAndUpdate(
//                 { User_id : loginKey },
//                 { $push: { 
//                         Portfolios : {
//                             Portfolio_id: portfolio._id
//                         }
//                     },
//                 },
//                 function (err, ) {
//                     if (err) throw err;
//                     res.send({message: 'first portfolio made', Id: portfolio._id});
//                 }
//             );
//         })       
//     })
// });

router.get('/:portfoliokey', function (req, res, next) {
    const { portfoliokey } = req.params;
    Portfolio.findOne({ _id: portfoliokey })
        .exec()
        .then(portfolio => {
            res.send({elementDatas: portfolio.Elements, selfintroDatas: portfolio.Selfintros, image: portfolio.Image});
        })
});

// router.get('/NFT', function (req, res, next) {
//     const { portfoliokey } = req.params;
//     Portfolio.findOne({ State: 2 })
//         .exec()
//         .then(portfolio => {
//             res.send({NFTimg: portfolio.NFTimg, NFTDate: portfolio.NFTDate, NFTComment: portfolio.NFTComment, NFTPrice: portfolioNFTPrice });
//         })
// });

module.exports = router;



// router.post('/:loginKey', function (req, res, next) {
//     const {loginKey} = req.params;
//     const { profile, self } = req.body;
//     User.findOne({ User_id: User_id }, function(err, user){
//         let 
//         const portfolio = new Portfolio({
//             Name: profile.name,
//             Age: profile.age,
//             Education: profile.education,
//             Major: profile.major,
//             Contents: profile.contents,
//             User_id: user._id,
//         });
//         console.log(portfolio);
//         portfolio.save()
//         res.json({ Post: '저장완료' })           
//     })

 
// });

// module.exports = router;
