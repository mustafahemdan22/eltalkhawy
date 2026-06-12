import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { QueryCtx, MutationCtx } from './_generated/server';

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return identity.subject;
}

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** List all media in the library (admin only) */
export const list = query({
  args: {
    folder: v.optional(v.union(
      v.literal('products'),
      v.literal('banners'),
      v.literal('categories'),
      v.literal('general'),
    )),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.folder) {
      return await ctx.db
        .query('media')
        .withIndex('by_folder', (q) => q.eq('folder', args.folder!))
        .order('desc')
        .collect();
    }
    return await ctx.db.query('media').order('desc').collect();
  },
});

/** Resolve a storageId to a temporary URL the browser can load. */
export const url = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Issue a one-time upload URL that the browser can POST a file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Persist an uploaded file to the media library. */
export const save = mutation({
  args: {
    storageId: v.id('_storage'),
    filename:  v.string(),
    mimeType:  v.string(),
    size:      v.number(),
    altText:   v.optional(v.string()),
    folder:    v.optional(v.union(
      v.literal('products'),
      v.literal('banners'),
      v.literal('categories'),
      v.literal('general'),
    )),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireAdmin(ctx);
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
      .unique();

    const id = await ctx.db.insert('media', {
      storageId:  args.storageId,
      filename:   args.filename,
      mimeType:   args.mimeType,
      size:       args.size,
      altText:    args.altText ?? null,
      folder:     args.folder ?? 'general',
      uploadedBy: user?._id ?? null,
    });
    return id;
  },
});

/** Update alt text or folder for an existing media item. */
export const update = mutation({
  args: {
    mediaId:  v.id('media'),
    altText:  v.optional(v.union(v.string(), v.null())),
    folder:   v.optional(v.union(
      v.literal('products'),
      v.literal('banners'),
      v.literal('categories'),
      v.literal('general'),
    )),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const patch: Record<string, unknown> = {};
    if (args.altText !== undefined) patch.altText = args.altText;
    if (args.folder !== undefined) patch.folder = args.folder;
    await ctx.db.patch(args.mediaId, patch);
    return args.mediaId;
  },
});

/** Delete a media item and free its storage. */
export const remove = mutation({
  args: { mediaId: v.id('media') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.mediaId);
    if (!item) throw new Error('Media not found');
    await ctx.storage.delete(item.storageId);
    await ctx.db.delete(args.mediaId);
    return args.mediaId;
  },
});
