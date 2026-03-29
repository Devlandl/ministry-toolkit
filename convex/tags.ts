import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByToolkit = query({
  args: { toolkitId: v.id("toolkits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("tags")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
  },
});

export const listAllByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
    const unique = [...new Set(tags.map((t) => t.label))];
    return unique.sort();
  },
});

export const add = mutation({
  args: { toolkitId: v.id("toolkits"), label: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("tags")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
    if (existing.some((t) => t.label === args.label)) return;
    return await ctx.db.insert("tags", {
      toolkitId: args.toolkitId,
      userId: identity.subject,
      label: args.label,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.userId !== identity.subject) throw new Error("Not found");
    await ctx.db.delete(args.tagId);
  },
});
