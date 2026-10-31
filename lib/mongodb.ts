import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Cache the connection across requests and development reloads.
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = (globalThis.mongoose ??= {
  conn: null,
  promise: null,
});

async function dbConnect() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    if (process.env.MONGODB_DB) {
      options.dbName = process.env.MONGODB_DB;
    }

    cached.promise = mongoose.connect(uri, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
