import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db88b16c/health", (c) => {
  return c.json({ status: "ok" });
});

// Save a gallery entry
app.post("/make-server-db88b16c/gallery", async (c) => {
  try {
    const body = await c.req.json();
    const { colors, palette, title, author, imageSrc } = body;
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return c.json({ error: "Missing required field: colors" }, 400);
    }
    const id = `gallery::${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const entry = {
      id,
      colors,
      palette: palette || [],
      title: title || "Untitled",
      author: author || "Anonymous",
      imageSrc: imageSrc || null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(id, entry);
    console.log(`Gallery entry saved: ${id}`);
    return c.json({ success: true, entry });
  } catch (err) {
    console.log(`Error saving gallery entry: ${err}`);
    return c.json({ error: `Failed to save gallery entry: ${err}` }, 500);
  }
});

// Get all gallery entries
app.get("/make-server-db88b16c/gallery", async (c) => {
  try {
    const entries = await kv.getByPrefix("gallery::");
    // Sort by createdAt descending
    entries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log(`Fetched ${entries.length} gallery entries`);
    return c.json({ entries });
  } catch (err) {
    console.log(`Error fetching gallery entries: ${err}`);
    return c.json({ error: `Failed to fetch gallery entries: ${err}` }, 500);
  }
});

// Delete a gallery entry
app.delete("/make-server-db88b16c/gallery/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const fullKey = id.startsWith("gallery::") ? id : `gallery::${id}`;
    await kv.del(fullKey);
    console.log(`Gallery entry deleted: ${fullKey}`);
    return c.json({ success: true });
  } catch (err) {
    console.log(`Error deleting gallery entry: ${err}`);
    return c.json({ error: `Failed to delete gallery entry: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);