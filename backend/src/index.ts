import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import 'dotenv/config';

// Import middleware
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';

// Import routes
import hairTemplatesRoute from './routes/hair-templates';
import profilesRoute from './routes/profiles';
import userModelsRoute from './routes/user-models';
import hairDesignsRoute from './routes/hair-designs';
import salonsRoute from './routes/salons';
import stylistsRoute from './routes/stylists';
import appointmentsRoute from './routes/appointments';
import chatRoute from './routes/chat';

// Import Supabase config
import './config/supabase';

const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: result.error.errors,
        },
        422
      );
    }
  },
});

// Global middleware
app.use('*', logger());
app.use('*', requestId());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://hairvision3d.com',
      'https://*.hairvision3d.com',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    message: 'HairVision 3D API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.route('/api/v1/hair-templates', hairTemplatesRoute);
app.route('/api/v1/profiles', profilesRoute);
app.route('/api/v1/user-models', userModelsRoute);
app.route('/api/v1/hair-designs', hairDesignsRoute);
app.route('/api/v1/salons', salonsRoute);
app.route('/api/v1/stylists', stylistsRoute);
app.route('/api/v1/appointments', appointmentsRoute);
app.route('/api/v1/chat', chatRoute);

// OpenAPI documentation
app.doc('/api/spec', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'HairVision 3D API',
    description: 'API for HairVision 3D hair styling platform',
    contact: {
      name: 'HairVision Team',
      email: 'api@hairvision3d.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Development server',
    },
    {
      url: 'https://api.hairvision3d.com',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Hair Templates', description: 'Hair style templates' },
    { name: 'Profiles', description: 'User profiles' },
    { name: 'User Models', description: 'User 3D models' },
    { name: 'Hair Designs', description: 'Custom hair designs' },
    { name: 'Salons', description: 'Beauty salons' },
    { name: 'Stylists', description: 'Hair stylists' },
    { name: 'Appointments', description: 'Salon appointments' },
    { name: 'Chat', description: 'Real-time chat' },
  ],
});

// Swagger UI
app.get('/api/docs', swaggerUI({ url: '/api/spec' }));

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: c.req.path,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
      requestId: c.get('requestId'),
    },
    500
  );
});

const port = parseInt(process.env.PORT || '8000');

console.log(`🚀 Starting HairVision 3D API server on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running at http://localhost:${info.port}`);
  console.log(`📚 API Documentation: http://localhost:${info.port}/api/docs`);
  console.log(`🔍 Health Check: http://localhost:${info.port}/health`);
});