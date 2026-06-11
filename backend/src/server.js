const { loadBackendEnv } = require('./config/loadEnv');
loadBackendEnv();
// Reload indicators queries after SQL modification
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const { testConnection } = require('./config/database');
const { testConnections } = require('./config/siteDatabase');
const authRoutes = require('./routes/auth');
const optimizedIndicatorsRoutes = require('./routes/optimized-indicators');
const reportsRoutes = require('./routes/reports');
const dqaRoutes = require('./routes/dqa');
const adminRoutes = require('./routes/admin');
const patient360Routes = require('./routes/patient360');
const visualizeRoutes = require('./routes/visualize');
const insightRoutes = require('./routes/insight');
const vcctRoutes = require('./routes/vcct');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: true, credentials: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_HTTP_LOG !== 'false') {
  app.use(morgan('combined'));
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/apiv1/auth', authRoutes);
app.use('/apiv1/indicators-optimized', optimizedIndicatorsRoutes);
app.use('/apiv1/dqa', dqaRoutes);
app.use('/apiv1/reports', reportsRoutes);
app.use('/apiv1/admin', adminRoutes);
app.use('/apiv1/patient-360', patient360Routes);
app.use('/apiv1/visualize', visualizeRoutes);
app.use('/apiv1/insight', insightRoutes);
app.use('/apiv1/vcct', vcctRoutes);
app.use('/apiv1/analytics', analyticsRoutes);
app.use('/apiv1/settings', settingsRoutes);

app.use((error, _req, res, _next) => {
  res.status(500).json({ success: false, error: error.message || 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.originalUrl });
});

async function start() {
  await testConnection().catch((error) => {
    console.error('Primary DB check failed:', error.message);
  });
  await testConnections().catch((error) => {
    console.error('Aggregate DB check failed:', error.message);
  });
  const { registerNationalityValueMaps } = require('./services/patient360Nationality');
  await registerNationalityValueMaps()
    .then(({ count }) => console.log(`Patient 360° nationality map loaded (${count} codes)`))
    .catch((error) => console.error('Nationality map load failed:', error.message));

  app.listen(port, '0.0.0.0', () => {
    console.log(`main_art_new backend running on ${port}`);
  });
}

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

module.exports = app;

// Trigger nodemon restart to load new SQL indicator files
