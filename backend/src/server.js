const { loadBackendEnv } = require('./config/loadEnv');
loadBackendEnv();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const { testConnection } = require('./config/database');
const { testConnections } = require('./config/siteDatabase');
const authRoutes = require('./routes/auth');
const lookupRoutes = require('./routes/lookups');
const optimizedIndicatorsRoutes = require('./routes/optimized-indicators');
const reportsRoutes = require('./routes/reports');

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/apiv1/auth', authRoutes);
app.use('/apiv1/lookups', lookupRoutes);
app.use('/apiv1/indicators-optimized', optimizedIndicatorsRoutes);
app.use('/apiv1/reports', reportsRoutes);

app.use((error, _req, res, _next) => {
  res.status(500).json({ success: false, error: error.message || 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.originalUrl });
});

async function start() {
  app.listen(port, '0.0.0.0', () => {
    console.log(`main_art_new backend running on ${port}`);
  });
  await testConnection().catch((error) => {
    console.error('Primary DB check failed:', error.message);
  });
  await testConnections().catch((error) => {
    console.error('Aggregate DB check failed:', error.message);
  });
}

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

module.exports = app;
