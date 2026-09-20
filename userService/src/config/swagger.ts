import swaggerJSDoc from 'swagger-jsdoc';

const userSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
} as const;

const paths = {
  '/api/v1/user/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', example: 'John' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'secret123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                  token: { type: 'string' },
                  user: userSchema,
                },
              },
            },
          },
        },
        400: { description: 'User already exists' },
      },
    },
  },
  '/api/v1/user/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login a user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'secret123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User logged in successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                  token: { type: 'string' },
                  user: userSchema,
                },
              },
            },
          },
        },
        400: { description: 'User not found or invalid password' },
      },
    },
  },
  '/api/v1/user/profile': {
    get: {
      tags: ['Auth'],
      summary: "Get the current user's profile",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                  user: userSchema,
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'User not found' },
      },
    },
  },
  '/api/v1/user/playlist': {
    post: {
      tags: ['Auth'],
      summary: 'Toggle a song in the user playlist',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id'],
              properties: {
                id: { type: 'string', example: '42' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Song added or removed from playlist successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                  user: userSchema,
                },
              },
            },
          },
        },
        400: { description: 'Song id is required' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/v1/user/users': {
    get: {
      tags: ['Auth'],
      summary: 'List all registered users (admin only)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Users retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                  users: { type: 'array', items: userSchema },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden' },
      },
    },
  },
  '/api/v1/user/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Log out and revoke the current token',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User logged out successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },
} as const;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'Auto-generated API docs for the user microservice (v1)',
    },
    servers: [{ url: 'http://localhost:6100' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths,
  },
  apis: ['./src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;