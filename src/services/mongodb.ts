import { MongoClient, Db, ObjectId, Collection } from "mongodb";

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

export type NusSyncData = {
  user_id?: number;
  net_id?: string;
  member_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  account_type?: string;
  submission_id: number;
  started_on?: string;
  submitted_on?: string;
  student_tags?: string;
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

const cached: Cached = globalForMongo._mongo ?? {
  client: null,
  db: null,
  promise: null,
};

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
  const registrations = db.collection<TelegramRegistration>(
    "telegram_registrations",
  );

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
    { upsert: true },
  );
}

// When user replies with studentId, complete the awaiting registration for the event
export async function completeRegistration(
  chatId: number,
  eventId: string,
  studentId: string,
) {
  const db = await connectToDb();
  const registrations = db.collection<TelegramRegistration>(
    "telegram_registrations",
  );

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
    { upsert: true },
  );
}

// Helper: check if this chat has an awaiting registration (and which event)
export async function findAwaitingByChat(chatId: number) {
  const db = await connectToDb();
  const registrations = db.collection<TelegramRegistration>(
    "telegram_registrations",
  );

  return registrations.findOne(
    { chatId, status: "awaiting_student_id" },
    { sort: { updatedAt: -1 } }, // most recent awaiting
  );
}

export async function saveNusSyncData(rows: NusSyncData[]) {
  const db = await connectToDb();
  const col = db.collection<NusSyncData>("nus_sync_users");

  const ops = rows
    .filter((r) => Number.isFinite(r.submission_id))
    .map((r) => ({
      updateOne: {
        filter: { submission_id: r.submission_id },
        update: { $set: r },
        upsert: true,
      },
    }));

  if (ops.length === 0)
    return { upsertedCount: 0 };

  const result = await col.bulkWrite(ops, { ordered: false });

  return {
    upsertedCount: result.upsertedCount,
  };
}
