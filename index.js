/* The express module is used to look at the address of the request and send it to the correct function */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var usermodel = require('./user.js').getModels();
var homeworkmodel = require('./hmwkuser1.js').getModels();
var crypto = require('crypto');
var Io = require('socket.io');


/* The http module is used to listen for requests from a web browser */
var http = require('http');

/* The path module is used to transform relative paths to absolute paths */
var path = require('path');

/* Creates an express application */
var app = express();
/* Creates the web server */
var server = http.createServer(app);

var io = Io(server);

/* Defines what port to use to listen to web requests */
var port =  process.env.PORT ? parseInt(process.env.PORT) : 8080;
var dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1/heww0';

function addSockets() {
	io.on('connection', (socket) => {
		console.log('user connected')
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
		socket.on('message', (message) => {
			io.emit('newMessage', message);
		});
	});
}

function startServer() {
		function authenticateUser(userName, password, callback) {
			if(!userName) return callback('Please enter a username!');
			if(!password) return callback('Please enter a password!');
			homeworkmodel.findOne({userName: userName}, function(err, user){
				if(err) return callback('Make sure you entered the user correctly');
				if(!user) return callback('Username not found');
				crypto.pbkdf2(password, user.salt, 10000, 256, 'sha256', function(err, hash) {
					if(err) return callback('Error hashing password')
					if(password === hash.toString('base64')) return callback('Wrong password');
					callback(null);
				});
			});
		}
		addSockets();
		app.use(bodyParser.json({ limit: '16mb' }));
		app.use(express.static(path.join(__dirname, 'public')));

		/* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
		app.get('/form', (req, res, next) => {

			/* Get the absolute path of the html file */
			var filePath = path.join(__dirname, './index.html')

			/* Sends the html file back to the browser */
			res.sendFile(filePath);
		});

		app.post('/form', (req, res, next) => {
			var newuser = new usermodel(req.body);
			var password = req.body.password;
			var salt = crypto.randomBytes(128).toString('base64');
			newuser.salt = salt;
			var iterations = 10000;
			crypto.pbkdf2(password, salt, iterations, 256, 'sha256', function(err, hash) {
				if(err) {
					return res.send({error: err});
				}
			newuser.password = hash.toString('base64');
			newuser.save(function(err) {
				if(err && err.message.includes('duplicate key error') && err.message.includes('userName')) {
					return res.send({error: 'Username, ' + req.body.userName + 'already taken'})
				}
				if(err) {
					return res.send({error: err.message})
				}
				res.send({error: null});
			})
		});
		});
		app.get('/login', (req, res, next) => {

			/* Get the absolute path of the html file */
			var filePath = path.join(__dirname, './login.html')

			/* Sends the html file back to the browser */
			res.sendFile(filePath);
		});

		app.get('/', (req, res, next) => {

			/* Get the absolute path of the html file */
			var filePath = path.join(__dirname, './login.html')

			/* Sends the html file back to the browser */
			res.sendFile(filePath);
		});

		app.post('/login', (req, res, next) => {
			var userName = req.body.userName;
			var password = req.body.password;

			authenticateUser(userName, password, function(err){
				res.send({error: err});
			});
		});
		app.get('/game', (req, res, next) => {

			/* Get the absolute path of the html file */
			var filePath = path.join(__dirname, './game.html')

			/* Sends the html file back to the browser */
			res.sendFile(filePath);
		});

		app.get('/signup', (req, res, next) => {

			/* Get the absolute path of the html file */
			var filePath = path.join(__dirname, './hmwkuser1.html')

			/* Sends the html file back to the browser */
			res.sendFile(filePath);
		});

		app.post('/signup', (req, res, next) => {
			var newuser = new homeworkmodel(req.body);
			var password = req.body.password;
			var salt = crypto.randomBytes(128).toString('base64');
			newuser.salt = salt;
			var iterations = 10000;
			crypto.pbkdf2(password, salt, iterations, 256, 'sha256', function(err, hash) {
				if(err) {
					return res.send({error: err});
				}
				newuser.password = hash.toString('base64');
				newuser.save(function(err) {
					if(err && err.message.includes('duplicate key error') && err.message.includes('username')) {
						return res.send({error: 'Username, ' + req.body.userName + '   already taken'})
					}
					if(err) {
						return res.send({error: err.message})
					}
					res.send({error: null});
				})
		});
		});

		/* Defines what function to all when the server recieves any request from http://localhost:8080 */
		server.on('listening', () => {

			/* Determining what the server is listening for */
			var addr = server.address()
				, bind = typeof addr === 'string'
					? 'pipe ' + addr
					: 'port ' + addr.port
			;

			/* Outputs to the console that the webserver is ready to start listenting to requests */
			console.log('Listening on ' + bind);
		});

		/* Tells the server to start listening to requests from defined port */
		server.listen(port);
}

mongoose.connect(dbAddress, startServer)
