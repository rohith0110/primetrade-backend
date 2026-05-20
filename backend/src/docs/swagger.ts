import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// note: real specs come from jsdoc comments on route files
const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Primetrade API',
      version: '1.0.0',
      description: 'Trade journal API with JWT auth and role-based access.',
    },
    servers: [{ url: '/api/v1' }],
    tags: [
      { name: 'auth', description: 'register, sign in, identity' },
      { name: 'me', description: 'the currently signed-in user' },
      { name: 'trades', description: 'crud on your own trade journal' },
      { name: 'admin', description: 'admin-only endpoints — manage users and view all trades' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.ts'],
});

export function mountSwagger(app: Express) {
  // swagger-ui-express ships handlers that fight strict express types; cast is fine
  app.use('/api/docs', swaggerUi.serve as never, swaggerUi.setup(spec) as never);
  app.get('/api/docs.json', (_req, res) => {
    res.json(spec);
  });
}
