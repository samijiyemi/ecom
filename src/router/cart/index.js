/** @format */

const express = require('express');
const Cart = require('../../models/cart');
const Item = require('../../models/item');
const User = require('../../models/user');
const Auth = require('../../middleware/Auth');

const router = express.Router();

router.get('/cart', Auth, async (req, res) => {
	const owner = req.user._id;

	try {
		const cart = await Cart.findOne({ owner });
		if (cart && cart.items.length > 0) {
			res.status(200).send({ cart });
		} else {
			res.send(null);
		}
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
});

// route that handle creating new cart
router.post('/cart', Auth, async (req, res) => {
	const owner = req.user._id;
	const { itemId, quantity } = req.body;

	try {
		const cart = await Cart.findOne({ owner });
		const item = await Item.findOne({ _id: itemId });

		// check if item does not exists
		if (!item) {
			return res.status(400).send({ msg: 'item not found!' });
		}

		const price = item.price;
		const name = item.name;

		// if cart already exist for user
		if (cart) {
			const itemIndex = cart.items.findIndex((item) => {
				item.itemId == itemId;
			});
			// check if product exist or not
			if (itemIndex > -1) {
				let product = cart.items[itemIndex];
				product.quantity += quantity;
				cart.bill = cart.items.reduce((acc, curr) => {
					return acc + curr.quantity * curr.price;
				}, 0);

				cart.items[itemIndex] = product;
				await cart.save();
				res.status(200).send(cart);
			} else {
				cart.items.push({ itemId, name, quantity, price });
				cart.bill = cart.items.reduce((acc, curr) => {
					return acc + curr.quantity * curr.price;
				}, 0);
				await cart.save();
				res.status(200).send({ cart });
			}
		} else {
			// no cart exist create one
			const newCart = await Cart.create({
				username,
				items: [{ itemId, name, quantity, price }],
				bill: quantity * price,
			});

			res.status(200).send(newCart);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send('something went wrong!');
	}
});

router.delete('/cart', Auth, async (req, res) => {
	const owner = req.user._id;
	const itemId = req.query.itemId;
	try {
		let cart = await Cart.findOne({ owner });
		const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
		if (itemIndex > -1) {
			let item = cart.items[itemIndex];
			cart.bill -= item.quantity * item.price;
			if (cart.bill < 0) {
				cart.bill = 0;
			}
			cart.items.splice(itemIndex, 1);
			cart.bill = cart.items.reduce((acc, curr) => {
				return acc + curr.quantity * curr.price;
			}, 0);
			cart = await cart.save();
			res.status(200).send(cart);
		} else {
			res.status(404).send('item not found');
		}
	} catch (error) {
		console.log(error);
		res.status(400).send();
	}
});

module.exports = router;
