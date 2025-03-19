const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const session = require('express-session'); 
const MongoStore = require('connect-mongo'); 
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders');

dotenv.config(); 

connectDB();


const app = express();
const port = process.env.PORT || 5000; 

app.use(cors({
  origin: [
    'http://localhost:3001', 
    'https://rugas-orm-client.onrender.com' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.use(bodyParser.json()); 
app.use(cookieParser());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 
  }),
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    httpOnly: true,
    sameSite: 'none',
    domain: process.env.NODE_ENV === 'production'
      ? 'rugas-orm-server.onrender.com' 
      : undefined
  },
  proxy: true 
}));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});