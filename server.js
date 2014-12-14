var express = require('express'),
		app = express();

// console.log(__dirname);

var router = express.Router();
app.use(express.static(__dirname + '/src'));
	//plugging in the middleware
	app.use(router);

require('./routes')(app);

var port = process.env.PORT || 3000;

app.listen(port);

console.log('server is running on port: ' + port);
