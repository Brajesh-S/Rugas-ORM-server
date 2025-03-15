const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  totalPrice: Number, 
  status: {
    type: String,
    enum: ['placed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed',
  },
  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);