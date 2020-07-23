var express =  require('express');
var helmet = require('helmet');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var yup = require('yup');
var { nanoid } = require('nanoid');

var app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev')); 
app.use(express.json());
app.use(express.static('public'));

//monk init
const url = 'mongodb://root:mongo123@ds011291.mlab.com:11291/heroku_8r1gqsrz';
var db = require('monk')(url);
var data = db.get('data');

//unique index on url id
data.createIndex('id', {unique: true});

//schema for mongodb doc using yup
const schema = yup.object().shape({
	id: yup.string().trim().matches(/[a-zA-Z0-9_\-]/).max(6),
	url: yup.string().trim().url().required()
});

//gets id of a url and redirects to url
app.get('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const url = await data.findOne({id: id});

		if(url) {
			res.redirect(url.url);
		}

		res.redirect();
	} catch(err) {
		// next(err);
		res.redirect();
	}
});

//creates new url with unique id
app.post('/create', async (req, res, next) => {

	let { id, url } = req.body;
	try {

		//vzlidate input formats
		await schema.validate({
			id: id,
			url: url
		});

		//generate id if no id supplied
		if(!id) id = nanoid(6);

		//insert into mongodb -> check if id exists within mongodb library
		try {
			await data.insert({
				id: id,
				url: url
			});

			res.json({
				message: 'You just shortened that URL dude',
				id: id,
				url: url,
			});

		} catch(err) {

			//error caught if duplicate entry in db
			next(err);
		}
	} catch(err) {

		//error caught if inputs didn't pass validation
		next(err);
	}
});

app.use(function(err, req, res, next) {
	res.json({message: err.message});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
	console.log(`Active on Port: ${PORT}`);
});
