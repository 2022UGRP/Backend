var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var forms = multer();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var portfoliosRouter = require('./routes/portfolios');
var nftsRouter = require('./routes/nfts');
var elementsRouter = require('./routes/elements');
var selfintrosRouter = require('./routes/selfintros');

var connect = require('./config/dbconfig');


var app = express();
const port = process.env.PORT || 8000;
connect();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(forms.array());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/portfolio', portfoliosRouter);
app.use('/api/nft', nftsRouter);
app.use('/api/element', elementsRouter);
app.use('/api/selfintro', selfintrosRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
