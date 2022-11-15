/** @format */

const express = require('express');
const Item = require('../../models/item');
const Auth = require('../../middleware/Auth');

const router = express.Router();

// route to create a new product
router.post('/items', Auth, async (req, res) => {
	try {
		const newItem = new Item({ ...req.body, owner: req.user._id });
		await newItem.save();
		res.status(200).send({ newItem });
	} catch (error) {
		res.status(400).send({ message: error });
	}
});

// route to get a particular item
router.get('/items/:id', async (req, res) => {
	try {
		const item = await Item.findOne({ _id: req.params.id });
		// if item not found
		if (!item) {
			res.status(400).send({ msg: 'item not found!' });
		}

		res.status(200).send({ item });
	} catch (error) {
		res.status(400).send(error);
	}
});

// route to fetch all items
router.get('/items', async (req, res) => {
	try {
		const items = await Item.find({});
		res.status(200).send({ items });
	} catch (error) {
		res.status(400).send({ err: error });
	}
});

// route to update an item
router.patch('/items/:id', Auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'description', 'category', 'price'];

	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: 'invalid updates' });
	}

	try {
		const item = await Item.findOne({ _id: req.params.id });
		if (!item) {
			return res.status(404).send();
		}

		updates.forEach((update) => (item[update] = req.body[update]));
		await item.save();
		res.send(item);
	} catch (error) {
		res.status(400).send(error);
	}
});

// route to delete item
router.delete('/items/:id', Auth, async (req, res) => {
	try {
		const deletedItem = await Item.findOneAndDelete({ _id: req.params.id });
		if (!deletedItem) {
			res.status(400).send({ error: 'item not found!' });
		}

		res.send({ msg: 'deleted!', deletedItem });
	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;
