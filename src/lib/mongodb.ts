import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB_NAME || 'pieco'; // Add this line

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable in .env.local');
}

// Define MongoClient options for optimal performance
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2,  // Minimum number of connections to keep open
  connectTimeoutMS: 5000, // Timeout for initial connection (5s)
  socketTimeoutMS: 10000, // Timeout for socket operations (10s)
  retryWrites: true, // Retry write operations on transient errors
  retryReads: true,  // Retry read operations on transient errors
  maxIdleTimeMS: 30000, // Close idle connections after 30s
};

// Global variable to store the client promise
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Initialize the client based on environment
if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('MongoDB connection error in development:', err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a single client instance
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('MongoDB connection error in production:', err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
}

// Export a function to get the database instance
export async function getDatabase() {
  const client = await clientPromise;
  return client.db(dbName);
}

// Optional: Add a function to close the connection (useful for cleanup in tests)
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    global._mongoClientPromise = undefined; // Reset for new connections
  }
}

// Export the database name for use in other files if needed
export { dbName };

export default clientPromise;