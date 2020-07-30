var Path = require('path');
var Express = require('express');
var Browserify = require('browserify-middleware');
var ServeIndex = require('serve-index')

var app = Express();

app.set('port', process.env.PORT || 6566);

if ('development' == app.get('env')) {
  app.use('/dist/stage.web.js', Browserify('./platform/web.js', {
    standalone : 'Stage'
  }));
}
app.use(Express.static(__dirname));

app.get('/', function(req, res) {
  res.redirect('./game-aero/')
});

app.get('/aero', function(req, res) {
  res.redirect('./game-aero/')
});

app.get('/asteroids', function(req, res) {
  res.redirect('./game-asteroids/')
});

app.use(ServeIndex(__dirname, {
  icons : true,
  css : 'ul#files li{float:none;}' // not actually working!
}));


app.listen(app.get('port'), function() {
  console.log('Checkout http://localhost:' + app.get('port'));
});