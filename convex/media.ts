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

/** Get Cloudinary URL for a public ID with optional transformations. */
export const getUrl = query({
  args: {
    publicId: v.string(),
    transformations: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      crop: v.optional(v.string()),
      gravity: v.optional(v.string()),
      quality: v.optional(v.string()),
      format: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? 'dfq1xxerr';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    const parts: string[] = [];
    if (args.transformations) {
      if (args.transformations.width) parts.push(`w_${args.transformations.width}`);
      if (args.transformations.height) parts.push(`h_${args.transformations.height}`);
      if (args.transformations.crop) parts.push(`c_${args.transformations.crop}`);
      if (args.transformations.gravity) parts.push(`g_${args.transformations.gravity}`);
      if (args.transformations.quality) parts.push(`q_${args.transformations.quality}`);
      if (args.transformations.format) parts.push(`f_${args.transformations.format}`);
    }
    
    const transformation = parts.join(',');
    const publicIdClean = args.publicId.startsWith('/') ? args.publicId.slice(1) : args.publicId;
    return `${baseUrl}/${transformation}/${publicIdClean}`;
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Persist an uploaded file's Cloudinary public ID to the media library. */
export const save = mutation({
  args: {
    publicId:  v.string(),
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
    width:     v.optional(v.number()),
    height:    v.optional(v.number()),
    format:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkId = await requireAdmin(ctx);
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', clerkId))
      .unique();

    const id = await ctx.db.insert('media', {
      publicId:   args.publicId,
      filename:   args.filename,
      mimeType:   args.mimeType,
      size:       args.size,
      altText:    args.altText ?? null,
      folder:     args.folder ?? 'general',
      uploadedBy: user?._id ?? null,
      width:      args.width ?? null,
      height:     args.height ?? null,
      format:     args.format ?? null,
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

/** Delete a media item from Cloudinary and the database. */
export const remove = mutation({
  args: { mediaId: v.id('media') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.mediaId);
    if (!item) throw new Error('Media not found');
    
    // Note: Actual Cloudinary deletion should be done via the API route
    // This just removes the DB record
    await ctx.db.delete(args.mediaId);
    return args.mediaId;
  },
});
