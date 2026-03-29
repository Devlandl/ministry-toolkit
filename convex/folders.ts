import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("folders", {
      userId: identity.subject,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: { folderId: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.patch(args.folderId, { name: args.name });
  },
});

export const remove = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== identity.subject)
      throw new Error("Not found");
    const toolkits = await ctx.db
      .query("toolkits")
      .withIndex("by_userId_folderId", (q) =>
        q.eq("userId", identity.subject).eq("folderId", args.folderId)
      )
      .collect();
    for (const toolkit of toolkits) {
      await ctx.db.patch(toolkit._id, { folderId: undefined });
    }
    await ctx.db.delete(args.folderId);
  },
});
