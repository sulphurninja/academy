import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Don't throw at module-load in dev — surface a helpful error on first connect attempt.
  console.warn(
    "[zapacademy] MONGODB_URI is not set. Login & lessons will fail until you configure it in .env.local."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __zapAcademyMongoose: MongooseCache | undefined;
}

let cached = global.__zapAcademyMongoose;

if (!cached) {
  cached = global.__zapAcademyMongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 60000,
        retryWrites: true,
        retryReads: true,
        autoIndex: process.env.NODE_ENV !== "production",
        family: 4,
      })
      .then((m) => {
        console.log("[zapacademy] ✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached!.promise = null;
        console.error("[zapacademy] ❌ MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
