require('dotenv').config();
const dns = require('dns');

// Fix DNS resolution issues for MongoDB Atlas SRV records
// Override DNS servers to Google and Cloudflare DNS, and prefer IPv4
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Trust proxy headers (Render sits behind a reverse proxy/load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security Middlewares
app.use(
  helmet({
    // Allow loading uploaded images on external frontend domains
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Enable response compression for performance
app.use(compression());

// CORS Configuration
const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like mobile apps, postman, server-to-server)
  if (!origin) return true;

  // 1. Allow localhost development
  if (/^http:\/\/localhost:(3000|5173)$/.test(origin)) {
    return true;
  }

  // 2. Allow Vercel preview & production deployments for this specific project
  // Matches: https://ecommerce-website.vercel.app & https://ecommerce-website-*.vercel.app
  if (/^https:\/\/ecommerce-website(-[a-zA-Z0-9\-]+)?\.vercel\.app$/.test(origin)) {
    return true;
  }

  // 3. Allow domains configured in FRONTEND_URL environment variable
  if (process.env.FRONTEND_URL) {
    const allowedOrigins = process.env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
      return true;
    }
  }

  return false;
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API Rate Limiting (Prevent brute-force / DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Ensure uploads directories exist
const uploadDirs = ['uploads', 'uploads/products', 'uploads/screenshots'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/buyers', require('./routes/buyers'));

// Simple Root Route
app.get('/', (req, res) => {
  res.send('J.G. Jeans Wholesale E-Commerce API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with retries & Start Server
const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB Connected successfully!');
      break;
    } catch (err) {
      console.error(`Database connection failure: ${err.message}`);
      retries -= 1;
      console.log(`Retries remaining: ${retries}`);
      if (retries === 0) {
        console.error('Could not connect to MongoDB after 5 attempts. Exiting...');
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

// Bootstrap Server
connectWithRetry().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});
