import { z } from 'zod';

export const JobMessageTypeEnum = z.enum(['example']);

export const JobMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: JobMessageTypeEnum.extract(['example']),
    id: z.string().optional(),
    payload: z.object({
      data: z.string(),
    }),
  }),
]);

export type JobMessage = z.infer<typeof JobMessageSchema>;
