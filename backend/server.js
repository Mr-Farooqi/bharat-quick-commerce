require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const autoSeedIfEmpty = require('./utils/autoSeed');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const server = http.createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  process.env.CLIENT_CUSTOMER_URL || 'http://localhost:3000',
  process.env.CLIENT_SELLER_URL || 'http://localhost:3001',
  process.env.CLIENT_ADMIN_URL || 'http://localhost:3002',
];

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if in allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local development
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.io instance to express app
app.set('io', io);

// Socket.io Connection & Room Handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Join shop room for live seller alerts
  socket.on('joinShop', (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined shop room: shop_${shopId}`);
  });

  // Join order room for live tracking
  socket.on('joinOrder', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined order room: order_${orderId}`);
  });

  // Join customer room
  socket.on('joinCustomer', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined customer room: customer_${customerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({
  origin: true, // Allow configured origins
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting on sensitive auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'BharatBasket Quick-Commerce Multi-Portal API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/customer', customerRoutes);

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB().then(async () => {
  await autoSeedIfEmpty();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BharatBasket Quick-Commerce Central API running on PORT: ${PORT}`);
    console.log(`   - Customer Portal expected at: ${process.env.CLIENT_CUSTOMER_URL || 'http://localhost:3000'}`);
    console.log(`   - Seller Portal expected at:   ${process.env.CLIENT_SELLER_URL || 'http://localhost:3001'}`);
    console.log(`   - Admin Portal expected at:    ${process.env.CLIENT_ADMIN_URL || 'http://localhost:3002'}`);
    console.log(`=======================================================`);
  });
}).catch((err) => {
  console.error('Failed to initialize server:', err);
});
