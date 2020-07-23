var express =  require('express');
var helmet = require('helmet');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var validUrl = require('valid-url');
var schemaValidator = require('schema-validator');
var yup = require('yup');
var { nanoid } = require('nanoid');


var app = express();
app.use(express.static('public'))
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

const schema = yup.object().shape({
	id: yup.string().trim().matches(/[a-zA-Z0-9_\-]/).max(6),
	url: yup.string().trim().url().required()
});

app.post('/create', async (req, res, next) => {
	// console.log(req.body);
	// const id = req.body.id;
	// const url = req.body.url;
	let { id, url } = req.body;

	try {
		await schema.validate({
			id: id,
			url: url
		});

		//generate id if none found
		if(!id) id = nanoid(6);


		

		
		res.json({
			message: 'url creation',
			id: id,
			url: url,
		});


	} catch(err) {
		next(err);
	}
});

const PORT = process.env.PORT || 6969;
app.listen(PORT, function() {
	console.log(`Active on Port: ${PORT}`);
});
