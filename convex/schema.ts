import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
  })
    .index("by_clerkId", ["clerkId"]),
});
