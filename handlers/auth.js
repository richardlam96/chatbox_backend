const db = require('../models');
const jwt = require('jsonwebtoken');


exports.register = async function(req, res, next) {
	try {
    // Simple password length check.
    if (req.body.password.length < 6) {
      next({
        status: 400,
        message: 'Password has to be at least 6 chars',
      });
    }
   
    // Create new user.
		let newUser = await db.User.create(req.body);
		let { id, username } = newUser;

    // Assign token to new user with available information.
		let token = jwt.sign({
      id,
			username,
		}, process.env.SECRET_KEY);

		return res.status(200).json({
			token,
      ...newUser._doc,
    });

	} catch(err) {
		if (err.code === 11000) {
			err.message = 'Sorry, username has been taken';
		}
		next({
			status: 400,
			message: err.message,
		});
	}
}

exports.signin = async function(req, res, next) {
	try {
		// Find user in database by username.
		let user = await db.User.findOne({
			username: req.body.username,
		});
		if (!user) {
			next({
				status: 401,
				message: 'Username could not be found'
			});
		}

		// Check given password.
		let isMatch = await user.comparePassword(req.body.password);
		if (isMatch) {
			let { id, username } = user;
			let token = jwt.sign({
				id, 
				username,
			}, process.env.SECRET_KEY);
			return res.status(200).json({
				token,
        ...user._doc,
      });
		} else {
			next({
				status: 401,
				message: 'Invalid password',
			});
		}
	} catch(err) {
		next({
			status: 401,
			message: 'Invalid credentials',
		});
	}
}
