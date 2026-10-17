import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const games = defineCollection({
  loader: file("./src/content/games.json"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      popularityIndex: z.number().int().positive(),
      url: z.url(),
      image: image().optional(),
    }),
});

export const collections = { games };
