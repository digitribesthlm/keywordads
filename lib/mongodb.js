import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URI
const dbName = process.env.DB_NAME
const options = {}

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (!process.env.DB_NAME) {
  throw new Error('Please add your DB_NAME to .env.local')
}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db(process.env.DB_NAME)
  return { db, client }
}

// Helper functions for common database operations
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

export async function getUserByEmail(email) {
  const collection = await getCollection('users')
  return collection.findOne({ email })
}

export async function getKeywordsByClientId(clientId) {
  const collection = await getCollection('keywords')
  return collection.find({ clientId }).toArray()
}

export async function getCampaignsByClientId(clientId) {
  const collection = await getCollection('kampanjer')
  return collection.find({ clientId }).toArray()
}

export async function logKeywordChange(keywordId, oldStatus, newStatus) {
  const collection = await getCollection('changeLogs')
  return collection.insertOne({
    keywordId,
    oldStatus,
    newStatus,
    timestamp: new Date()
  })
} 