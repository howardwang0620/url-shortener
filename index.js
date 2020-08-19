var express =  require('express');
var helmet = require('helmet');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var yup = require('yup');
var { nanoid } = require('nanoid');
var createError = require('http-errors');
var path = require('path');

//middleware stuff
var app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev')); 
app.use(express.json());
app.use(express.static('public'));

//monk init to connect to mlabs on heroku
const url = 'mongodb://root:mongo123@ds011291.mlab.com:11291/heroku_8r1gqsrz';
var db = require('monk')(url);
var data = db.get('data');

//unique index on url id
data.createIndex('id', {unique: true});

//schema for mongodb doc using yup to validate inputs (url, slug)
const schema = yup.object().shape({
	id: yup.string().trim().matches(/[\w\-]/).max(6),
	url: yup.string().trim().url().required()
});


//gets id of a url and redirects to url
app.get('/:id', async (req, res) => {
	const id = req.params.id.toLowerCase();

	try {
		const url = await data.findOne({id: id});
		if(url) {
			res.redirect(url.url);
		}

		//no url was found - redirect
		// res.redirect(`/?error=${id} not found`);
		res.redirect('/error/404');
	} catch(err) {

		//id not found - redirect
		// return next(createError(400, ''));
		// res.redirect(`/error=Link not found`);
		res.redirect('/error/404');
	}
});

//error page
app.get('/error/404', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/error.html'));
});

//creates new url with unique id if not supplied
app.post('/create', async (req, res, next) => {

	//grab body inputs
	let { id, url } = req.body;
	try {
		//generate id if no id supplied
		//nanoid: for there to be a one in a billion chance of duplication, 103 trillion version 4 IDs must be generated.
		if(!id) id = nanoid(6);

		//validate input formats using yup schema
		await schema.validate({
			id: id,
			url: url
		});

		//insert into mongodb -> check if id exists within mongodb library -> should check for collisions here
		id = id.toLowerCase();
		url = url.toLowerCase();
		try {

			//insert into mongo db
			await data.insert({
				id: id,
				url: url
			});

			//response json contains - message, generated/supplied id, supplied url
			return res.json({
				message: `👆🙏🔑: shortnr.link/${id}`,
				id: id,
				url: url,
			});

		} catch(err) {

			//error caught if db already contains supplied key
			return next(createError(400, 'that key already exists 😩'));
		}
	} catch(err) {

		//error caught if inputs didn't pass validation
		return next(createError(400, 'id or url doesn\'t look right 🥵'));
	}
});

//fall through function sending error messages back to client
app.use(function(err, req, res, next) {
	return res.json({status: err, message: err.message});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
	console.log(`Active on Port: ${PORT}`);
});
