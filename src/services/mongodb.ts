import { MongoClient, Db, ObjectId } from "mongodb";

type RegistrationStatus = "awaiting_student_id" | "registered";

type TelegramRegistration = {
  _id?: ObjectId;
  chatId: number;
  eventId: string;
  studentId?: string;
  status: RegistrationStatus;
  createdAt: Date;
  updatedAt: Date;
};

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DBNAME;

if (!uri) {
  throw new Error("Missing env var: MONGODB_URI");
}

type Cached = {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as unknown as { _mongo?: Cached };

const cached: Cached =
  globalForMongo._mongo ?? { client: null, db: null, promise: null };

globalForMongo._mongo = cached;

export async function connectToDb(): Promise<Db> {
  if (cached.db) return cached.db;

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect();
  }

  cached.client = await cached.promise;
  cached.db = dbName ? cached.client.db(dbName) : cached.client.db();

  return cached.db;
}

// Creates or resets an awaiting registration for this chatId + eventId
export async function upsertStartRegistration(chatId: number, eventId: string) {
  const db = await connectToDb();
  const registrations = db.collection<TelegramRegistration>("telegram_registrations");

  await registrations.updateOne(
    { chatId, eventId },
    {
      $set: {
        status: "awaiting_student_id",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
      // don't wipe studentId if they already registered for this event
      // (if you WANT to allow re-register, you can also $unset: { studentId: "" } here)
    },
    { upsert: true }
  );
}

// When user replies with studentId, complete the awaiting registration for the event
export async function completeRegistration(chatId: number, eventId: string, studentId: string) {
  const db = await connectToDb();
  const registrations = db.collection<TelegramRegistration>("telegram_registrations");

  await registrations.updateOne(
    { chatId, eventId },
    {
      $set: {
        studentId,
        status: "registered",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

// Helper: check if this chat has an awaiting registration (and which event)
export async function findAwaitingByChat(chatId: number) {
  const db = await connectToDb();
  const registrations = db.collection<TelegramRegistration>("telegram_registrations");

  return registrations.findOne(
    { chatId, status: "awaiting_student_id" },
    { sort: { updatedAt: -1 } } // most recent awaiting
  );
}
