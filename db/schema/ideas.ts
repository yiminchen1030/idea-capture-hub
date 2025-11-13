import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const idea = pgTable("idea", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    product: text("product").notNull(),
    customer: text("customer").notNull(),
    businessModel: text("business_model").notNull(),
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => ({
    userIdIndex: index("idea_user_id_idx").on(table.userId),
}));

export type IdeaSelect = typeof idea.$inferSelect;
export type IdeaInsert = typeof idea.$inferInsert;