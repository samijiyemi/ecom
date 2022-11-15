/** @format */
require('dotenv').config();
const express = require('express');
const path = require('path');
const userRoute = require('./router/user');
const itemRoute = require('./router/item');
const cartRoute = require('./router/cart');
const orderRoute = require('./router/order');
const connectDB = require('./db/mongoose');

const ApiError = require('./db/ErrorHandler');

const app = express();
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;

// register route here
app.use(userRoute);
app.use(itemRoute);
app.use(cartRoute);
app.use(orderRoute);

const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

app.get('/', (req, res) => {
	res.sendFile('index.html');
});

// send back 404 error to any invalid request
app.use((req, res, next) => {
	const error = new ApiError('route not found!', 404);
	throw error;
});

// Handle error
app.use((err, req, res, next) => {
	if (res.headerSent) {
		return next(err);
	}

	res.status(err.code || 500);
	res.json({ msg: err.message || 'An unknown error occur!' });
});

// listen to connections
const startServer = () => {
	try {
		connectDB(process.env.MONGODB_URL);
		app.listen(port, () => {
			console.log(`server listening on port ${port}`);
		});
	} catch (err) {}
};

startServer();
