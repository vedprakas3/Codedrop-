import mongoose from "mongoose";

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
  url: String
});

const File = mongoose.models.File || mongoose.model("File", FileSchema);

export default async function handler(req, res) {
  await connectDB();

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Code required" });
  }

  const file = await File.findOne({ code });

  if (!file) {
    return res.status(404).json({ error: "Invalid code" });
  }

  res.redirect(file.url);
}
