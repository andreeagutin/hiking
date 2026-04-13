const spec = {
  openapi: '3.0.3',
  info: {
    title: "Hike'n'Seek API",
    version: '1.0.0',
    description: 'REST API for the Hike\'n\'Seek hiking trail tracker. Public endpoints are read-only. Admin endpoints require a Bearer JWT obtained from `POST /api/auth/login`. User endpoints require a Bearer JWT obtained from `POST /api/users/login`.',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Development' },
  ],
  components: {
    securitySchemes: {
      adminAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '8-hour admin JWT — obtain from POST /api/auth/login',
      },
      userAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '30-day user JWT — obtain from POST /api/users/login',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      HistoryEntry: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          time: { type: 'number', nullable: true, description: 'Hours on trail' },
          is_hike: { type: 'boolean' },
          distance: { type: 'number', nullable: true, description: 'km' },
          up: { type: 'number', nullable: true, description: 'Elevation gain (m)' },
          down: { type: 'number', nullable: true, description: 'Elevation loss (m)' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Hike: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string', nullable: true },
          time: { type: 'number', nullable: true, description: 'Hours' },
          distance: { type: 'number', nullable: true, description: 'km' },
          tip: { type: 'string', nullable: true, enum: ['Dus-intors', 'Dus', null] },
          up: { type: 'number', nullable: true, description: 'Elevation gain (m)' },
          difficulty: { type: 'string', nullable: true, enum: ['easy', 'medium', null] },
          mountains: { type: 'string', nullable: true },
          zone: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          photos: { type: 'array', items: { type: 'string' } },
          mainPhoto: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          startLat: { type: 'number', nullable: true },
          startLng: { type: 'number', nullable: true },
          mapUrl: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          sources: { type: 'array', items: { type: 'string' } },
          familyFriendly: { type: 'boolean' },
          minAgeRecommended: { type: 'number', nullable: true },
          strollerAccessible: { type: 'boolean' },
          toddlerFriendly: { type: 'boolean' },
          kidEngagementScore: { type: 'number', nullable: true, minimum: 1, maximum: 5 },
          highlights: { type: 'array', items: { type: 'string' } },
          hasRestAreas: { type: 'boolean' },
          restAreaCount: { type: 'number', nullable: true },
          hasBathrooms: { type: 'boolean' },
          bathroomType: { type: 'string', nullable: true, enum: ['flush', 'pit', 'none', null] },
          hasPicknicArea: { type: 'boolean' },
          nearbyPlayground: { type: 'boolean' },
          bearRisk: { type: 'string', nullable: true, enum: ['low', 'medium', 'high', null] },
          sheepdogWarning: { type: 'boolean' },
          safeWaterSource: { type: 'boolean' },
          mobileSignal: { type: 'string', nullable: true, enum: ['good', 'partial', 'none', null] },
          trailMarkers: { type: 'array', items: { type: 'string' }, description: 'Ordered marker IDs e.g. ["yellow_circle", "red_stripe"]' },
          salvamontPoint: { type: 'string', nullable: true },
          history: { type: 'array', items: { $ref: '#/components/schemas/HistoryEntry' } },
          restaurants: { type: 'array', items: { type: 'string' }, description: 'Restaurant ObjectIds (or populated objects on GET /:id)' },
          pois: { type: 'array', items: { type: 'string' }, description: 'POI ObjectIds (populated on GET /:id)' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Restaurant: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string', nullable: true, enum: ['Restaurant', 'Cabana', 'Pensiune', 'Cafenea', null] },
          mountains: { type: 'string', nullable: true },
          zone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          link: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      Poi: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string', nullable: true },
          poiType: { type: 'string', nullable: true, description: 'e.g. "Cave", "Waterfall", "Viewpoint"' },
          photos: { type: 'array', items: { type: 'string' } },
          mainPhoto: { type: 'string', nullable: true },
          mountains: { type: 'string', nullable: true },
          development: { type: 'number', nullable: true, description: 'Total surveyed length (m) — caves' },
          verticalExtent: { type: 'number', nullable: true, description: 'Height difference entrance-to-lowest (m) — caves' },
          altitude: { type: 'number', nullable: true, description: 'Entrance altitude (m)' },
          rockType: { type: 'string', nullable: true },
          zone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          link: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          lat: { type: 'number', nullable: true },
          lng: { type: 'number', nullable: true },
          active: { type: 'boolean' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          children: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                birthYear: { type: 'number', nullable: true },
              },
            },
          },
          subscription: { type: 'string', enum: ['free', 'explorer', 'pro'] },
          subExpiresAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Admin authentication' },
    { name: 'Users', description: 'User accounts & profiles' },
    { name: 'Hikes', description: 'Hiking trails (public read, admin write)' },
    { name: 'Restaurants', description: 'Restaurants & accommodation (public read, admin write)' },
    { name: 'POIs', description: 'Points of interest (public read, admin write)' },
    { name: 'Mountains', description: 'Static mountain ranges list' },
    { name: 'AI Search', description: 'Natural language trail search via Claude Haiku' },
    { name: 'Upload', description: 'Cloudinary image upload' },
  ],
  paths: {
    // ─── Auth ───────────────────────────────────────────────────
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Admin login',
        description: 'Returns an 8-hour JWT for admin operations. Rate-limited to 10 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many attempts', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── Users ──────────────────────────────────────────────────
    '/api/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Create user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, format: 'password' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Account created',
            content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/login': {
      post: {
        tags: ['Users'],
        summary: 'User login',
        description: 'Returns a 30-day JWT. Rate-limited to 10 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many attempts', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ userAuth: [] }],
        responses: {
          200: { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ userAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  children: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        birthYear: { type: 'number', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Updated profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/me/subscription': {
      get: {
        tags: ['Users'],
        summary: 'Get subscription status',
        security: [{ userAuth: [] }],
        responses: {
          200: {
            description: 'Subscription info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    subscription: { type: 'string', enum: ['free', 'explorer', 'pro'] },
                    subExpiresAt: { type: 'string', format: 'date-time', nullable: true },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── Hikes ──────────────────────────────────────────────────
    '/api/hikes': {
      get: {
        tags: ['Hikes'],
        summary: 'List all hikes',
        description: 'Returns active hikes by default. Pass `all=true` (admin only in practice) to include inactive ones.',
        parameters: [
          {
            name: 'all',
            in: 'query',
            schema: { type: 'string', enum: ['true'] },
            description: 'Include inactive hikes',
          },
        ],
        responses: {
          200: {
            description: 'Array of hikes',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Hike' } } } },
          },
        },
      },
      post: {
        tags: ['Hikes'],
        summary: 'Create hike',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Hike' } } },
        },
        responses: {
          201: { description: 'Created hike', content: { 'application/json': { schema: { $ref: '#/components/schemas/Hike' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/hikes/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Hike ObjectId or slug',
        },
      ],
      get: {
        tags: ['Hikes'],
        summary: 'Get single hike',
        description: 'Returns the hike with `pois` array populated.',
        responses: {
          200: { description: 'Hike', content: { 'application/json': { schema: { $ref: '#/components/schemas/Hike' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Hikes'],
        summary: 'Update hike',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Hike' } } },
        },
        responses: {
          200: { description: 'Updated hike', content: { 'application/json': { schema: { $ref: '#/components/schemas/Hike' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Hikes'],
        summary: 'Delete hike',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/hikes/{id}/history': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Hike ObjectId' },
      ],
      post: {
        tags: ['Hikes'],
        summary: 'Add history entry',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HistoryEntry' } } },
        },
        responses: {
          201: { description: 'Created entry', content: { 'application/json': { schema: { $ref: '#/components/schemas/HistoryEntry' } } } },
          404: { description: 'Hike not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/hikes/{id}/history/{entryId}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Hike ObjectId' },
        { name: 'entryId', in: 'path', required: true, schema: { type: 'string' }, description: 'History entry ObjectId' },
      ],
      put: {
        tags: ['Hikes'],
        summary: 'Update history entry',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HistoryEntry' } } },
        },
        responses: {
          200: { description: 'Updated entry', content: { 'application/json': { schema: { $ref: '#/components/schemas/HistoryEntry' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Hikes'],
        summary: 'Delete history entry',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── Restaurants ────────────────────────────────────────────
    '/api/restaurants': {
      get: {
        tags: ['Restaurants'],
        summary: 'List all restaurants',
        responses: {
          200: {
            description: 'Array of restaurants',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } } } },
          },
        },
      },
      post: {
        tags: ['Restaurants'],
        summary: 'Create restaurant',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } },
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/restaurants/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Restaurant ObjectId' },
      ],
      get: {
        tags: ['Restaurants'],
        summary: 'Get single restaurant',
        responses: {
          200: { description: 'Restaurant', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Restaurants'],
        summary: 'Update restaurant',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } },
        },
        responses: {
          200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Restaurants'],
        summary: 'Delete restaurant',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── POIs ───────────────────────────────────────────────────
    '/api/poi': {
      get: {
        tags: ['POIs'],
        summary: 'List all POIs',
        responses: {
          200: {
            description: 'Array of POIs',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Poi' } } } },
          },
        },
      },
      post: {
        tags: ['POIs'],
        summary: 'Create POI',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Poi' } } },
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Poi' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/poi/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'POI ObjectId or slug' },
      ],
      get: {
        tags: ['POIs'],
        summary: 'Get single POI',
        responses: {
          200: { description: 'POI', content: { 'application/json': { schema: { $ref: '#/components/schemas/Poi' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['POIs'],
        summary: 'Update POI',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Poi' } } },
        },
        responses: {
          200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Poi' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['POIs'],
        summary: 'Delete POI',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── Mountains ──────────────────────────────────────────────
    '/api/mountains': {
      get: {
        tags: ['Mountains'],
        summary: 'List Romanian mountain ranges',
        description: 'Returns a static list of Romanian mountain ranges used as suggestions in filters and forms.',
        responses: {
          200: {
            description: 'Array of mountain range names',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } },
          },
        },
      },
    },

    // ─── AI Search ──────────────────────────────────────────────
    '/api/ai-search': {
      post: {
        tags: ['AI Search'],
        summary: 'Natural language hike search',
        description: 'Sends a free-form query (RO or EN) to Claude Haiku which returns structured JSON filters and an explanation string.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query'],
                properties: {
                  query: { type: 'string', maxLength: 500, description: 'Free-form search query', example: 'Vreau un traseu ușor pentru copii sub 3 ore' },
                  mountains: { type: 'array', items: { type: 'string' }, description: 'Available mountain range names (passed as context to Claude)' },
                  zones: { type: 'array', items: { type: 'string' }, description: 'Available zone names (passed as context to Claude)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Parsed filters and explanation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    filters: {
                      type: 'object',
                      description: 'Structured filter object',
                      properties: {
                        maxHikeHours: { type: 'number' },
                        minHikeHours: { type: 'number' },
                        maxDistanceKm: { type: 'number' },
                        minDistanceKm: { type: 'number' },
                        maxElevation: { type: 'number' },
                        minElevation: { type: 'number' },
                        difficulty: { type: 'string', enum: ['easy', 'medium'] },
                        mountains: { type: 'string' },
                        zone: { type: 'string' },
                        tip: { type: 'string', enum: ['Dus-intors', 'Dus'] },
                        maxDriveHours: { type: 'number' },
                        familyFriendly: { type: 'boolean' },
                        strollerAccessible: { type: 'boolean' },
                        toddlerFriendly: { type: 'boolean' },
                        bearRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
                        mobileSignal: { type: 'string', enum: ['good', 'partial', 'none'] },
                        hasBathrooms: { type: 'boolean' },
                        hasPicknicArea: { type: 'boolean' },
                        nearbyPlayground: { type: 'boolean' },
                        safeWaterSource: { type: 'boolean' },
                        hasRestAreas: { type: 'boolean' },
                        sheepdogFree: { type: 'boolean' },
                        highlights: { type: 'array', items: { type: 'string' } },
                      },
                    },
                    explanation: { type: 'string', description: 'Human-readable summary in the query\'s language' },
                  },
                },
              },
            },
          },
          400: { description: 'Query missing or too long', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Claude API error (check ANTHROPIC_API_KEY)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ─── Upload ─────────────────────────────────────────────────
    '/api/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload image to Cloudinary',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Upload result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Cloudinary secure URL' },
                  },
                },
              },
            },
          },
          400: { description: 'No file provided', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

export default spec;
