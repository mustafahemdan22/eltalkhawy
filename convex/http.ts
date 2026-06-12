import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error: Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying signature", { status: 400 });
    }

    const { type, data } = evt;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const primaryEmailId = data.primary_email_address_id;
        const primaryEmailObj = data.email_addresses?.find((e) => e.id === primaryEmailId);
        const email = primaryEmailObj?.email_address ?? data.email_addresses?.[0]?.email_address ?? "";
        const firstName = data.first_name ?? "";
        const lastName = data.last_name ?? "";
        const name = `${firstName} ${lastName}`.trim() || null;
        const imageUrl = data.image_url || null;

        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email,
          name,
          imageUrl,
        });
        break;
      }
      case "user.deleted": {
        if (data.id) {
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkId: data.id,
          });
        }
        break;
      }
      default:
        // Unhandled Clerk webhook event type: ${type}
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
