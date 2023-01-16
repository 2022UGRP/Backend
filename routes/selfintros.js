var express = require('express');
var router = express.Router();
const Selfintro = require('../schema/selfintro');
const portfolio = require('../schema/portfolio');

router.post('/:Portfolio_id', function (req, res, next) {
  const { title, date, contents } = req.body;
  const { Portfolio_id } = req.params;
  const selfintro = new Selfintro({
    Portfolio_id: Portfolio_id,
    Title: title,
    Date: date,
    Contents: contents,
  });
  Selfintro.create(selfintro, (e, s) => {
    portfolio.findOneAndUpdate(
      { _id: Portfolio_id },
      { $push: { Selfintros: selfintro }, },
      function (err, Uresult) {
        if (err) throw err;
      }
    );
  });
  res.json({ Post: ' element 저장완료' });
});

module.exports = router;