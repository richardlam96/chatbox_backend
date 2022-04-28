require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const server = app.listen(process.env.PORT || 3000, function() {
	console.log('Discord Clone started.');
});
// const http = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');
const cors = require('cors');

const { errorHandler } = require('./handlers/error');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const serverRoutes = require('./routes/server');
const channelRoutes = require('./routes/channel');
const messageRoutes = require('./routes/message');
const friendsRoutes = require('./routes/friends');


app.use(cors());
app.use(bodyParser.json());

// Routes.
app.use('/api/auth', authRoutes);

app.use('/api/users', 
  loginRequired,
	userRoutes
);

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

app.use('/api/users/:userId/friends',
  loginRequired,
  ensureCorrectUser,
  friendsRoutes
);


// Default error and error handler.
app.use(function(req, res, next) {
	let err = new Error('Not found.');
	err.status = 404;
	next(err);
});

app.use(errorHandler);

io
.on('connection', socket => {
	console.log('connected with io');

  // Socket for private rooom for direct messages and friend requests.
  socket.on('join', data => {
    socket.join(data.username);
  });

  // Socket for sending friend requests.
  socket.on('invite', data => {
    io.in(data.receiver).emit('invite', {
      sender: data.sender,
    });
  });

  // Socket for switching rooms to chat.
	socket.on('change room', ({ newRoom }) => {
		socket.leave(socket.room);
		socket.join(newRoom);
		socket.room = newRoom;
		socket.emit('change room', { 
			ok: true,
			room: socket.room,
		});
	});

  // Socket for sending messages in a room.
	socket.on('send', msg => {
		io.in(socket.room).emit('send', msg);
	});

	socket.on('disconnect', () => {
		console.log('disconnected');
	});
});

// Production.
// app.use(express.static(path.join(__dirname, 'build')));
// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
// app.get('/service-worker.js', function (req, res) {
//     res.sendFile(path.join(__dirname, '..', 'build', 'service-worker.js'));
// });

// http.listen(process.env.PORT || 3000, function() {
// 	console.log('Discord Clone started.');
// });