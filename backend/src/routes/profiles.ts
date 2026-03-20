import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { supabase } from '../config/supabase';

const app = new OpenAPIHono();

// Get current user profile
const getProfileRoute = createRoute({
  method: 'get',
  path: '/me',
  tags: ['Profiles'],
  summary: 'Get current user profile',
  responses: {
    200: {
      description: 'User profile',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().uuid(),
            username: z.string(),
            full_name: z.string().nullable(),
            avatar_url: z.string().nullable(),
            email: z.string().email(),
          }),
        },
      },
    },
  },
});

app.openapi(getProfileRoute, async (c) => {
  // TODO: Implement JWT token validation and user extraction
  return c.json({
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'demo_user',
    full_name: 'Demo User',
    avatar_url: null,
    email: 'demo@example.com',
  });
});

export default app;