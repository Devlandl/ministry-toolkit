import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    folderId: v.optional(v.id("folders")),
    favoritesOnly: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;

    let toolkits;
    if (args.folderId) {
      toolkits = await ctx.db
        .query("toolkits")
        .withIndex("by_userId_folderId", (q) =>
          q.eq("userId", userId).eq("folderId", args.folderId)
        )
        .collect();
    } else {
      toolkits = await ctx.db
        .query("toolkits")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
    }

    if (args.favoritesOnly) {
      toolkits = toolkits.filter((t) => t.isFavorite);
    }

    if (args.search) {
      const term = args.search.toLowerCase();
      toolkits = toolkits.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.verse && t.verse.toLowerCase().includes(term)) ||
          (t.topic && t.topic.toLowerCase().includes(term))
      );
    }

    return toolkits.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { toolkitId: v.id("toolkits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const toolkit = await ctx.db.get(args.toolkitId);
    if (!toolkit) return null;
    if (toolkit.userId === identity.subject) return toolkit;
    const share = await ctx.db
      .query("shares")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
    const isShared = share.some(
      (s) =>
        s.sharedWithUserId === identity.subject ||
        s.sharedWithEmail === identity.tokenIdentifier
    );
    if (isShared) return toolkit;
    return null;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("toolkits", {
      userId: identity.subject,
      title: args.title,
      verse: args.verse,
      topic: args.topic,
      audience: args.audience,
      sermonOutline: args.sermonOutline,
      objectLesson: args.objectLesson,
      discussionQuestions: args.discussionQuestions,
      prayerPoints: args.prayerPoints,
      kidsVersion: args.kidsVersion,
      folderId: undefined,
      isFavorite: false,
      createdAt: Date.now(),
    });
  },
});

export const toggleFavorite = mutation({
  args: { toolkitId: v.id("toolkits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const toolkit = await ctx.db.get(args.toolkitId);
    if (!toolkit || toolkit.userId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.patch(args.toolkitId, { isFavorite: !toolkit.isFavorite });
  },
});

export const moveToFolder = mutation({
  args: {
    toolkitId: v.id("toolkits"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const toolkit = await ctx.db.get(args.toolkitId);
    if (!toolkit || toolkit.userId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.patch(args.toolkitId, { folderId: args.folderId });
  },
});

export const remove = mutation({
  args: { toolkitId: v.id("toolkits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const toolkit = await ctx.db.get(args.toolkitId);
    if (!toolkit || toolkit.userId !== identity.subject)
      throw new Error("Not found");
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
    for (const tag of tags) {
      await ctx.db.delete(tag._id);
    }
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
    for (const share of shares) {
      await ctx.db.delete(share._id);
    }
    await ctx.db.delete(args.toolkitId);
  },
});
