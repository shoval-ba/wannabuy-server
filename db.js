const MongoClient = require("mongodb").MongoClient;
// const env = process.argv[2] || "prod";
// require("custom-env").env(env);

const dotenv = require('dotenv');
dotenv.config();
const { MONGO_DB_URI, MONGO_DB } = process.env;

if (!MONGO_DB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

exports.connectToDatabase = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        cached.promise = MongoClient.connect(MONGO_DB_URI, opts).then((client) => {
            return {
                client,
                db: client.db(MONGO_DB),
            };
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

