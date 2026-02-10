import mongoose from "mongoose";
import { nanoid } from "nanoid";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const FileSchema = new mongoose.Schema({
  code: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

const File = mongoose.models.File || mongoose.model("File", FileSchema);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  await connectDB();

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  const code = nanoid(6);

  await File.create({ code, url });

  res.status(200).json({ success: true, code });
}
