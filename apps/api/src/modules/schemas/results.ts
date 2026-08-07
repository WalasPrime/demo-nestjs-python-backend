import { z } from 'zod';

export const ResultMessageStatusEnum = z.enum(['done']);

export const ResultMessageSchema = z.discriminatedUnion('status', [
  z.object({
    status: ResultMessageStatusEnum.extract(['done']),
    data: z.any(),
  }),
]);

export type ResultMessage = z.infer<typeof ResultMessageSchema>;
