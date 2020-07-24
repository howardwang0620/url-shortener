var express =  require('express');
var helmet = require('helmet');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var yup = require('yup');
var { nanoid } = require('nanoid');
var createError = require('http-errors');

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
	id: yup.string().trim().matches(/[\w\-]/).max(6),
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

		//no url was found
		res.redirect(`/?error=${id} not found`);
	} catch(err) {

		//id not found
		// return next(createError(400, ''));
		res.redirect(`/error=Link not found`);
	}
});

//creates new url with unique id
app.post('/create', async (req, res, next) => {

	let { id, url } = req.body;
	try {
		//generate id if no id supplied
		if(!id) id = nanoid(6);

		//validate input formats
		await schema.validate({
			id: id,
			url: url
		});

		//insert into mongodb -> check if id exists within mongodb library -> should check for collisions here
		try {
			await data.insert({
				id: id,
				url: url
			});

			return res.json({
				message: `👆🙏🔑: ${id}`,
				id: id,
				url: url,
			});

		} catch(err) {

			//error caught if duplicate entry in db
			return next(createError(400, 'That key already exists 😩'));
		}
	} catch(err) {

		//error caught if inputs didn't pass validation
		return next(createError(400, 'id or url doesn\'t look right 🥵'));
	}
});

app.use(function(err, req, res, next) {
	res.json({status: err, message: err.message});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
	console.log(`Active on Port: ${PORT}`);
});
