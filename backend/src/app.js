const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Logging ---
const morganStream = { write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()) };
app.use(morgan(config.isProduction ? 'combined' : 'dev', { stream: morganStream }));

// --- Health check (used by deployment platforms & uptime monitors) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptimeSeconds: process.uptime(), timestamp: new Date().toISOString() });
});

// --- API documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'EntreSkill Hub API Docs' }));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// --- Rate limiting ---
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);

// --- Versioned API routes ---
app.use('/api/v1', routes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
