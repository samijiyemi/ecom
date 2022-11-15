/** @format */

const express = require('express');
const User = require('../../models/user');
const Auth = require('../../middleware/Auth');

const router = express.Router();

// Registration route for user
router.post('/users', async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

// Login route for user
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentails(
			req.body.email,
			req.body.password
		);

		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (error) {
		res.status(400).send({ msg: error.message });
	}
});

// Logout route for user
router.post('/users/logout', Auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token != req.token;
		});

		await req.user.save();
		res.send('user logout sucessfully!');
	} catch (error) {
		res.status(500).send({ msg: error.message });
	}
});

// Logout from all devices
router.post('/users/logoutall', Auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send('logout from all devices');
	} catch (error) {
		res.status(500).send({ msg: error.message });
	}
});

module.exports = router;
