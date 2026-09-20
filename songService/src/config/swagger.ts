import swaggerJSDoc from 'swagger-jsdoc';

const paths: Record<string, unknown> = {
  '/api/v1/songs': {
    get: {
      tags: ['Songs'],
      summary: 'Get all songs',
      description: 'Fetches all songs ordered by newest first',
      responses: {
        200: { description: 'Songs fetched successfully' },
        500: { description: 'Internal Server Error' },
      },
    },
  },
  '/api/v1/albums': {
    get: {
      tags: ['Albums'],
      summary: 'Get all albums',
      description: 'Fetches all albums ordered by newest first',
      responses: {
        200: { description: 'Albums fetched successfully' },
        500: { description: 'Internal Server Error' },
      },
    },
  },
  '/api/v1/albums/{albumId}/songs': {
    get: {
      tags: ['Albums'],
      summary: 'Get all songs of an album',
      description: 'Fetches all songs belonging to the album with the given id',
      parameters: [
        {
          name: 'albumId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Songs fetched successfully' },
        400: { description: 'Invalid album id or album not found' },
      },
    },
  },
  '/api/v1/songs/{songId}': {
    get: {
      tags: ['Songs'],
      summary: 'Get a single song',
      description: 'Fetches a single song by its id',
      parameters: [
        {
          name: 'songId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Song fetched successfully' },
        400: { description: 'Invalid song id' },
        404: { description: 'Song not found' },
      },
    },
  },
  '/api/v1/songs/{songId}/download': {
    get: {
      tags: ['Songs'],
      summary: 'Download a song as an audio file',
      description: 'Streams the audio file for a song through the service so the browser avoids cross-origin restrictions',
      parameters: [
        {
          name: 'songId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Audio file streamed with attachment disposition (audio/mpeg)' },
        400: { description: 'Invalid song id' },
        404: { description: 'Song not found' },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Song Service API',
      version: '1.0.0',
      description: 'Auto-generated API docs for the song/streaming microservice (v1)',
    },
    servers: [{ url: 'http://localhost:8000' }],
    paths,
  },
  apis: ['./src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;