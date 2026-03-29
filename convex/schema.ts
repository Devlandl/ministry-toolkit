import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  toolkits: defineTable({
    userId: v.string(),
    title: v.string(),
    verse: v.optional(v.string()),
    topic: v.optional(v.string()),
    audience: v.union(
      v.literal("adults"),
      v.literal("youth"),
      v.literal("kids")
    ),
    sermonOutline: v.string(),
    objectLesson: v.string(),
    discussionQuestions: v.string(),
    prayerPoints: v.string(),
    kidsVersion: v.string(),
    folderId: v.optional(v.id("folders")),
    isFavorite: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_folderId", ["userId", "folderId"]),

  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  tags: defineTable({
    toolkitId: v.id("toolkits"),
    userId: v.string(),
    label: v.string(),
    createdAt: v.number(),
  })
    .index("by_toolkitId", ["toolkitId"])
    .index("by_userId", ["userId"]),

  shares: defineTable({
    toolkitId: v.id("toolkits"),
    sharedByUserId: v.string(),
    sharedWithEmail: v.string(),
    sharedWithUserId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_sharedWithEmail", ["sharedWithEmail"])
    .index("by_sharedWithUserId", ["sharedWithUserId"])
    .index("by_toolkitId", ["toolkitId"]),
});
