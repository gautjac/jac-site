import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).optional().default([]),
    linkedinUrl: z.string().optional(),
    coverImage: z.string().optional(),
    lang: z.enum(['en', 'fr']).default('en'),
  }),
});

export const collections = { posts };
