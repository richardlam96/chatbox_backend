require('dotenv').config();
const express = require('express');
const app = express();

// Imports for real time.
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const bodyParser = require('body-parser');
const cors = require('cors');

const { errorHandler } = require('./handlers/error');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const channelRoutes = require('./routes/channel');
const messageRoutes = require('./routes/message');


app.use(cors());
app.use(bodyParser.json());

// Routes.
app.use('/api/auth', authRoutes);
app.use('/api/users/:userId',
  loginRequired,
  ensureCorrectUser,
  serverRoutes
);
app.use('/api/users/:userId',
  loginRequired, 
  ensureCorrectUser,
  channelRoutes
);
app.use('/api/users/:userId',
  loginRequired, 
  messageRoutes
);

// Default error and error handler.
app.use(function(req, res, next) {
	let err = new Error('Not found.');
	err.status = 404;
	next(err);
});

app.use(errorHandler);

// Real time setup
io.on('connection', socket => {
	console.log('connected with io');

	socket.on('send', msg => {
		console.log(msg);
		io.emit('send', msg);
	});

	socket.on('disconnect', () => {
		console.log('disconnected');
	});
});


http.listen(process.env.PORT || 3000, process.env.IP, function() {
	console.log('Discord Clone started.');
});
