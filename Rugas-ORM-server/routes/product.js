const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    if (req.file && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    const { name, category, description, price } = req.body;
    const image = req.file ? {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    } : null;

    const product = new Product({
      name,
      category,
      description,
      price,
      image,
    });

    await product.save();

    const responseProduct = product.toObject();
    if (responseProduct.image) {
      responseProduct.image = {
        contentType: responseProduct.image.contentType,
        data: responseProduct.image.data.toString('base64')
      };
    }

    res.status(201).json(responseProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const { category, name } = req.query;

    const query = {};
    if (category) query.category = category; 
    if (name) query.name = { $regex: name, $options: 'i' };
    const products = await Product.find(query).lean();
    
    const formattedProducts = products.map(product => ({
      ...product,
      image: product.image ? {
        contentType: product.image.contentType,
        data: product.image.data.toString('base64')
      } : null
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;