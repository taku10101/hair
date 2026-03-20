import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

const getHairDesignsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Hair Designs'],
  summary: 'Get hair designs',
  responses: {
    200: {
      description: 'List of hair designs',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              id: z.string().uuid(),
              title: z.string(),
              status: z.string(),
              created_at: z.string(),
            })),
          }),
        },
      },
    },
  },
});

app.openapi(getHairDesignsRoute, async (c) => {
  return c.json({ data: [] });
});

export default app;