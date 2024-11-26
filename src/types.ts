import { z } from '@botpress/sdk'
import * as bp from '.botpress'

export const Node18UniversalStreamWrapperSchema = z.object({
    readableStream: z.object({
      locked: z.boolean(),
      state: z.string(),
      supportsBYOB: z.boolean()
    }),
    reader: z.object({
      stream: z.object({
        locked: z.boolean(),
        state: z.string(),
        supportsBYOB: z.boolean()
      }),
      readRequests: z.number(),
      close: z.instanceof(Promise).optional()
    }),
    events: z.object({
      data: z.array(z.unknown()),
      end: z.array(z.unknown()),
      error: z.array(z.unknown()),
      readable: z.array(z.unknown()),
      close: z.array(z.unknown()),
      pause: z.array(z.unknown()),
      resume: z.array(z.unknown())
    }),
    paused: z.boolean(),
    resumeCallback: z.function().nullable(),
    encoding: z.string().nullable()
  });
  