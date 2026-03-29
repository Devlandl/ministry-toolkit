import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listSharedWithMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const email = identity.email;

    const byUserId = await ctx.db
      .query("shares")
      .withIndex("by_sharedWithUserId", (q) =>
        q.eq("sharedWithUserId", userId)
      )
      .collect();

    let byEmail: typeof byUserId = [];
    if (email) {
      byEmail = await ctx.db
        .query("shares")
        .withIndex("by_sharedWithEmail", (q) =>
          q.eq("sharedWithEmail", email)
        )
        .collect();
      for (const share of byEmail) {
        if (!share.sharedWithUserId) {
          await ctx.db.patch(share._id, { sharedWithUserId: userId });
        }
      }
    }

    const allShares = [...byUserId, ...byEmail];
    const seen = new Set<string>();
    const unique = allShares.filter((s) => {
      const key = s._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const toolkits = await Promise.all(
      unique.map(async (share) => {
        const toolkit = await ctx.db.get(share.toolkitId);
        return toolkit ? { ...toolkit, shareId: share._id, sharedByUserId: share.sharedByUserId } : null;
      })
    );

    return toolkits.filter(Boolean);
  },
});

export const share = mutation({
  args: {
    toolkitId: v.id("toolkits"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const toolkit = await ctx.db.get(args.toolkitId);
    if (!toolkit || toolkit.userId !== identity.subject)
      throw new Error("Not found");
    const existing = await ctx.db
      .query("shares")
      .withIndex("by_toolkitId", (q) => q.eq("toolkitId", args.toolkitId))
      .collect();
    if (existing.some((s) => s.sharedWithEmail === args.email)) {
      throw new Error("Already shared with this person");
    }
    return await ctx.db.insert("shares", {
      toolkitId: args.toolkitId,
      sharedByUserId: identity.subject,
      sharedWithEmail: args.email,
      sharedWithUserId: undefined,
      createdAt: Date.now(),
    });
  },
});

export const unshare = mutation({
  args: { shareId: v.id("shares") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const share = await ctx.db.get(args.shareId);
    if (!share || share.sharedByUserId !== identity.subject)
      throw new Error("Not found");
    await ctx.db.delete(args.shareId);
  },
});
