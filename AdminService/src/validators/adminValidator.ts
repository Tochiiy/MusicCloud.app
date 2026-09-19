import { z } from 'zod';



export const albumSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
});


export const songSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  album: z.coerce.number().int().positive(),
});

export type AlbumInput = z.infer<typeof albumSchema>;
export type SongInput = z.infer<typeof songSchema>;