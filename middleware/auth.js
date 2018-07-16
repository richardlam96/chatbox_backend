require('dotenv').config();
const jwt = require('jsonwebtoken');


exports.loginRequired = async function(req, res, next) {
	try {
    if (!req.headers.authorization) {
      throw new Error('No Authorization Header.');
    }
		const token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, process.env.SECRET_KEY, function(err, payload) {
			if (payload) {
				next();
			} else {
				next({
					status: 401,
					message: 'Please log in first.',
          token,
				});
			}
		});
	} catch(err) {
		next({
      err,
			status: 401,
			message: err.message,
		});
	}
}

exports.ensureCorrectUser = async function(req, res, next) {}
