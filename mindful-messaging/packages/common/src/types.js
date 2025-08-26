import { z } from 'zod';
// Base entity type
export const EntitySchema = z.object({
    text: z.string(),
    type: z.enum(['PERSON', 'LOC', 'ORG', 'DATE', 'TIME']),
    confidence: z.number().min(0).max(1),
    source: z.string().optional(),
});
const PersonEntitySchema = EntitySchema.extend({
    type: z.literal('PERSON'),
});
const PlaceEntitySchema = EntitySchema.extend({
    type: z.literal('LOC'),
});
const DateOrTimeEntitySchema = EntitySchema.extend({
    type: z.enum(['DATE', 'TIME']),
});
// Task and Risk schemas
export const TaskSchema = z.object({
    text: z.string().describe('The action item itself'),
    due: z.string().datetime().optional().describe('ISO 8601 date'),
    assignedTo: z.string().optional(),
    confidence: z.number(),
});
export const RiskSchema = z.object({
    type: z.enum(['boundary', 'harassment', 'pii', 'commitment_conflict']),
    note: z.string(),
    confidence: z.number(),
});
// The core analysis response object
export const AnalysisResponseSchema = z.object({
    id: z.string().uuid(),
    originalText: z.string(),
    insights: z.object({
        tasks: z.array(TaskSchema),
        dates: z.array(DateOrTimeEntitySchema),
        people: z.array(PersonEntitySchema),
        places: z.array(PlaceEntitySchema),
        questions: z.array(z.string()),
        risks: z.array(RiskSchema),
    }),
    suggestedReplies: z.array(z.object({
        text: z.string(),
        tone: z.enum(['calm', 'firm', 'warm']),
    })),
});
