var express =  require('express');
var helmet = require('helmet');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');


var app = express();
app.use(helmet());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
	res.json({
		message: 'home page'
	});
});

app.get('/:id', (req, res) => {
	console.log(req.url);
	res.json({
		message: 'url retrieval',
		id: req.url
	});
});

app.post('/create', (req, res) => {

	console.log(req.body);
	res.json({
		message: 'url creation',
		id: req.body.id,
		url: req.body.url,
	});
});

const PORT = process.env.PORT || 6969;
app.listen(PORT, function() {
	console.log(`Active on Port: ${PORT}`);
});
