const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Start server
app.listen(PORT, () => {
  console.log(`Server běží na ${process.env.NODE_ENV === 'production' ? 'onRender' : `http://localhost:${PORT}`}`);
});