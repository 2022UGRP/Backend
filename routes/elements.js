var express = require('express');
var router = express.Router();
const Element = require('../schema/element');
const portfolio = require('../schema/portfolio');

router.post('/:Portfolio_id', function (req, res, next) {
  const { activity, contents } = req.body;
  const { Portfolio_id } = req.params;
  const element = new Element({
    Portfolio_id: Portfolio_id,
    Activity: activity,
    Contents: contents,
  })
  // console.log(element);
  // element.save()
  element.save(function (drr, dResult) {
    portfolio.findOneAndUpdate(
      { _id: Portfolio_id },
      { $push: { Elements: element }, },
      function (err, Uresult) {
        if (err) throw err;
      }
    );
  })
  res.json({ Post: ' element 저장완료' });
});

module.exports = router;