var express = require('express');
const Portfolio = require('../schema/portfolio');
var router = express.Router();
const User = require('../schema/user');

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(`email: ${email}, password: ${password}`);
  const user = await User.findOne({ Email: email, Password: password })
  if (!user) {
    res.json({ login: false })
  } else {
    const portfolio = await Portfolio.findOne({ User_id: user._id })
    res.json({ login: true, Id: user._id, Name: user.Name, Age: user.Age, School: user.School, Major: user.Major, Portfolio_id: portfolio._id, Image: portfolio.Image });
  }
})

router.post('/signup', function (req, res, next) {
  const { email, name, phoneNumber, password, age, school, major } = req.body;
  // console.log(`email: ${email}, password: ${password}`);
  const insertUser = new User({ Email: email, Name: name, Phone: phoneNumber, Password: password, School: school, Age: age, Major: major });
  insertUser.save(function (error) {
    if (error) throw error;
    res.send({ message: `insert success`, Id: insertUser._id, Name: name, School: school, Major: major, Age: age });
  })
});

module.exports = router;