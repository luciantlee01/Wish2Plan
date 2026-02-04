import { z } from 'zod'

export const ingestSchema = z.object({
  text: z.string().min(1),
})

export const ideaCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  source: z.enum(['TIKTOK', 'INSTAGRAM', 'OTHER', 'TEXT']),
  category: z.enum(['DATE', 'GIFT', 'MEAL']).optional(),
  status: z.enum(['SAVED', 'PLANNED', 'DONE']).optional(),
  imageUrl: z.string().url().nullable().optional(),
  placeName: z.string().nullable().optional(),
  placeAddress: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  rawText: z.string().nullable().optional(),
})

export const ideaUpdateSchema = ideaCreateSchema.partial()

export const ideasQuerySchema = z.object({
  category: z.enum(['DATE', 'GIFT', 'MEAL']).optional(),
  status: z.enum(['SAVED', 'PLANNED', 'DONE']).optional(),
  search: z.string().optional(),
})

export const geocodeSchema = z.object({
  query: z.string().min(1),
})

export const planCreateSchema = z.object({
  title: z.string().min(1),
  scheduledFor: z.string().datetime(),
  notes: z.string().nullable().optional(),
})

export const planUpdateSchema = planCreateSchema.partial()

export const planItemCreateSchema = z.object({
  planId: z.string(),
  ideaId: z.string(),
  sortOrder: z.number().optional(),
})

