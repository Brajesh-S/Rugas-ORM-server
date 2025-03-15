const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const { status, customer, category, customerName } = req.query;
    const matchStage = {};

    if (status) matchStage.status = status;
    if (customer) matchStage.customer = mongoose.Types.ObjectId(customer);

    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: '$customerDetails' },
      { $addFields: { customerName: '$customerDetails.name' } },
      { $match: matchStage }
    ];

    if (category) {
      pipeline.push({
        $match: {
          'productDetails.category': category
        }
      });
    }

    if (customerName) {
      pipeline.push({
        $match: {
          customerName: { $regex: customerName, $options: 'i' }
        }
      });
    }

    pipeline.push({
      $project: {
        customerDetails: 0,
        productDetails: { __v: 0 } 
      }
    });

    const orders = await Order.aggregate(pipeline);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customer products.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;