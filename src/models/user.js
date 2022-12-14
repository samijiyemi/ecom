/** @format */
require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// create the user schema
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is invalid');
				}
			},
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
			trim: true,
			validate(value) {
				if (value.toLowerCase().includes('password')) {
					throw new Error('password must not contain password');
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

// get username
userSchema.methods.getUserName = async function () {
	const user = this;
	return user.name;
};

// Hash password before saving into the database
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

// Login user
userSchema.statics.findByCredentails = async function (email, password) {
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error('unable to login!');
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error('unable to login');
	}

	return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
