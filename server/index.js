const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const environment = process.env.NODE_ENV || 'development';
const allowedOrigins = environment === 'production'
  ? ['https://kalendar-taupe.vercel.app'] // Production URL
  : ['http://localhost:5173'];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Testing endpoint
app.get('/', (req, res) => {
  res.send('Express backend je spuštěný');
});

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB připojeno'))
.catch((err) => console.error('Chyba při připojení k MongoDB:', err));

// Routes
const userRoutes = require('./routes/auth');
app.use('/api/auth', userRoutes);

const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server běží na ${process.env.NODE_ENV === 'production' ? 'onRender' : `http://localhost:${PORT}`}`);
});