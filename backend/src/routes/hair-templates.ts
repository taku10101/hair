import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { supabase } from '../config/supabase';

const app = new OpenAPIHono();

// Schemas
const HairTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  description: z.string().nullable(),
  category: z.string().max(50),
  style_tags: z.array(z.string()).nullable(),
  gender_target: z.enum(['male', 'female', 'unisex']).nullable(),
  difficulty_level: z.number().int().min(1).max(5).nullable(),
  model_data: z.any(),
  preview_images: z.array(z.string()).nullable(),
  metadata: z.any().nullable(),
  is_popular: z.boolean(),
  usage_count: z.number().int(),
  rating: z.number(),
  created_by: z.string().uuid().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const CreateHairTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  style_tags: z.array(z.string()).optional(),
  gender_target: z.enum(['male', 'female', 'unisex']).optional(),
  difficulty_level: z.number().int().min(1).max(5).optional(),
  model_data: z.any(),
  preview_images: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

const UpdateHairTemplateSchema = CreateHairTemplateSchema.partial();

const GetTemplatesQuerySchema = z.object({
  category: z.string().optional(),
  gender_target: z.enum(['male', 'female', 'unisex']).optional(),
  popular: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
  search: z.string().optional(),
});

// Get all hair templates
const getTemplatesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Hair Templates'],
  summary: 'Get hair templates',
  description: 'Retrieve paginated list of hair templates with optional filtering',
  request: {
    query: GetTemplatesQuerySchema,
  },
  responses: {
    200: {
      description: 'List of hair templates',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(HairTemplateSchema),
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(getTemplatesRoute, async (c) => {
  const { category, gender_target, popular, limit = 10, offset = 0, search } = c.req.valid('query');

  let query = supabase
    .from('hair_templates')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (gender_target) {
    query = query.eq('gender_target', gender_target);
  }

  if (popular) {
    query = query.eq('is_popular', true);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    data: data || [],
    total: count || 0,
    limit,
    offset,
  });
});

// Get template by ID
const getTemplateRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Hair Templates'],
  summary: 'Get hair template by ID',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: 'Hair template details',
      content: {
        'application/json': {
          schema: HairTemplateSchema,
        },
      },
    },
    404: {
      description: 'Template not found',
    },
  },
});

app.openapi(getTemplateRoute, async (c) => {
  const { id } = c.req.valid('param');

  const { data, error } = await supabase
    .from('hair_templates')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return c.json({ error: 'Template not found' }, 404);
  }

  // Increment usage count
  await supabase
    .from('hair_templates')
    .update({ usage_count: data.usage_count + 1 })
    .eq('id', id);

  return c.json(data);
});

// Create new template (admin only)
const createTemplateRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Hair Templates'],
  summary: 'Create new hair template',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateHairTemplateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Template created successfully',
      content: {
        'application/json': {
          schema: HairTemplateSchema,
        },
      },
    },
  },
});

app.openapi(createTemplateRoute, async (c) => {
  const templateData = c.req.valid('json');

  const { data, error } = await supabase
    .from('hair_templates')
    .insert([templateData])
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 400);
  }

  return c.json(data, 201);
});

// Update template (admin only)
const updateTemplateRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Hair Templates'],
  summary: 'Update hair template',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateHairTemplateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Template updated successfully',
      content: {
        'application/json': {
          schema: HairTemplateSchema,
        },
      },
    },
    404: {
      description: 'Template not found',
    },
  },
});

app.openapi(updateTemplateRoute, async (c) => {
  const { id } = c.req.valid('param');
  const updateData = c.req.valid('json');

  const { data, error } = await supabase
    .from('hair_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return c.json({ error: 'Template not found or update failed' }, 404);
  }

  return c.json(data);
});

export default app;