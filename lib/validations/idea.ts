import { z } from "zod";

export const createIdeaSchema = z.object({
  product: z.string().min(1, "Product description is required").max(500, "Product description too long"),
  customer: z.string().min(1, "Customer description is required").max(500, "Customer description too long"),
  businessModel: z.string().min(1, "Business model description is required").max(500, "Business model description too long"),
});

export const updateIdeaSchema = z.object({
  product: z.string().min(1, "Product description is required").max(500, "Product description too long").optional(),
  customer: z.string().min(1, "Customer description is required").max(500, "Customer description too long").optional(),
  businessModel: z.string().min(1, "Business model description is required").max(500, "Business model description too long").optional(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;