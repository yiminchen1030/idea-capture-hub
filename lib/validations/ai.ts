import { z } from "zod";

export const aiSuggestionSchema = z.object({
  fieldType: z.enum(["product", "customer", "businessModel"], {
    errorMap: () => ({ message: "Field type must be one of: product, customer, businessModel" }),
  }),
  context: z.string().max(1000, "Context too long").optional(),
});

export const aiResponseSchema = z.object({
  suggestions: z.array(z.string().min(1).max(200)),
});

export type AiSuggestionInput = z.infer<typeof aiSuggestionSchema>;
export type AiResponseOutput = z.infer<typeof aiResponseSchema>;