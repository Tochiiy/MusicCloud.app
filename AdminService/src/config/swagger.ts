import swaggerJSDoc from 'swagger-jsdoc';

const paths = {
  '/api/v1/admin/album/new': {
    post: {
      tags: ['Albums'],
      summary: 'Add a new album with an image upload',
      description:
        'Uploads the thumbnail to Cloudinary and stores the album in Postgres. Requires an admin JWT.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['title', 'description', 'file'],
              properties: {
                title: { type: 'string', example: 'My First Album' },
                description: { type: 'string', example: 'Row of songs' },
                file: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Album added successfully' },
        400: { description: 'Validation error or album already exists' },
        401: { description: 'Unauthorized' },
        500: { description: 'Failed to upload file' },
      },
    },
  },
  '/api/v1/admin/song/new': {
    post: {
      tags: ['Songs'],
      summary: 'Add a new song to an album',
      description:
        'Uploads the audio to Cloudinary and stores the song in Postgres. Requires an admin JWT.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['title', 'description', 'album', 'file'],
              properties: {
                title: { type: 'string', example: 'My Song' },
                description: { type: 'string', example: 'Track description' },
                album: { type: 'integer', example: 1 },
                file: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Song added successfully' },
        400: { description: 'Validation error or album not found' },
        401: { description: 'Unauthorized' },
        500: { description: 'Failed to upload file' },
      },
    },
  },
  '/api/v1/admin/song/thumbnail/{songId}': {
    post: {
      tags: ['Songs'],
      summary: 'Upload or replace a song thumbnail',
      description: 'Uploads the image to Cloudinary and updates the song. Requires an admin JWT.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'songId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Thumbnail uploaded successfully' },
        400: { description: 'Validation error or song not found' },
        401: { description: 'Unauthorized' },
        500: { description: 'Failed to upload file' },
      },
    },
  },
  '/api/v1/admin/album/{albumId}': {
    delete: {
      tags: ['Albums'],
      summary: 'Delete an album',
      description: 'Cascade-deletes the album and its songs (DB + Cloudinary assets). Requires an admin JWT.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'albumId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Album deleted successfully' },
        400: { description: 'Invalid or missing album id' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/api/v1/admin/song/{songId}': {
    delete: {
      tags: ['Songs'],
      summary: 'Delete a song',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'songId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Song deleted successfully' },
        400: { description: 'Invalid or missing song id' },
        401: { description: 'Unauthorized' },
      },
    },
  },
} as const;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin Service API',
      version: '1.0.0',
      description: 'Auto-generated API docs for the admin microservice (v1)',
    },
    servers: [{ url: 'http://localhost:7000' }],
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