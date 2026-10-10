require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes/apiRoutes');
const mockRoutes = require('./src/routes/mockRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', apiRoutes);
app.use('/mock', mockRoutes);
app.use(errorHandler);

connectDB().then(() =>
  app.listen(PORT, () => console.log(`MockFlow running on http://localhost:${PORT}`))
);
