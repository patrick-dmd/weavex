import { z } from "zod";

export const postSchema = z.object({
  text: z.string().min(5).max(2000),
  images: z.array(z.union([z.string(), z.instanceof(File)])).max(4),
  visibility: z
    .string()
    .refine((value) => ["public", "private", "followers"].includes(value), {
      message: "Please select a valid visibility option.",
    }),
});
