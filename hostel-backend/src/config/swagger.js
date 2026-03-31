import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hostel Management API',
      version: '1.0.0',
      description: 'API documentation for the Hostel Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT access token stored in httpOnly cookie'
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ]
  },
  // Look for Swagger comments in all module route files
  apis: ['./src/modules/**/*.Routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
