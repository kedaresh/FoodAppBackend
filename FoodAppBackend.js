const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/fooddb', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Define food schema
const foodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  foodType: { type: String, enum: ['delicious food', 'nutritious food', 'fast food', 'beverages', 'dessert'], required: true },
  maxDeliveryTime: { type: Number, required: true },
  price: { type: Number, required: true }
});

const Food = mongoose.model('Food', foodSchema);

const app = express();
app.use(express.json());

// Get all food items
app.get('/food', async (req, res) => {
  const foods = await Food.find();
  res.send(foods);
});

// Get food items by type
app.get('/food', async (req, res) => {
  const { type } = req.query;
  const foods = await Food.find({ foodType: type });
  res.send(foods);
});

// Get food items by type and max delivery time
app.get('/food', async (req, res) => {
  const { type, maxdeliverytime } = req.query;
  const foods = await Food.find({ foodType: type, maxDeliveryTime: { $lte: maxdeliverytime } });
  res.send(foods);
});

// Get food item by id
app.get('/food/:id', async (req, res) => {
  const food = await Food.findById(req.params.id);
  if (!food) return res.status(404).send('Food item not found');
  res.send(food);
});

// Create a new food item
app.post('/food', async (req, res) => {
  const { error } = validateFood(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const food = new Food({
    foodName: req.body.foodName,
    foodType: req.body.foodType,
    maxDeliveryTime: req.body.maxDeliveryTime,
    price: req.body.price
  });

  await food.save();
  res.send(food);
});

// Update a food item
app.put('/food/:id', async (req, res) => {
  const { error } = validateFood(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const food = await Food.findByIdAndUpdate(req.params.id, {
    foodName: req.body.foodName,
    foodType: req.body.foodType,
    maxDeliveryTime: req.body.maxDeliveryTime,
    price: req.body.price
  }, { new: true });

  if (!food) return res.status(404).send('Food item not found');
  res.send(food);
});

