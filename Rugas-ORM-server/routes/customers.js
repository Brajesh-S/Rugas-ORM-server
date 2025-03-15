const express = require('express');
const router = express.Router();
const Customer = require('../models/customers');
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
    try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  router.get('/', auth, async (req, res) => {
    try {
      const { name, email } = req.query;
      let query = {};
      if (name) query.name = { $regex: name, $options: 'i' };
      if (email) query.email = { $regex: email, $options: 'i' };
      const customers = await Customer.find(query);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  module.exports = router;