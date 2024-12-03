import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URI
const dbName = process.env.DB_NAME
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

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
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    return { db, client }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Helper functions with better error handling
export async function getCollection(collectionName) {
  try {
    const { db } = await connectToDatabase()
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    throw error
  }
}

export async function getUserByEmail(email) {
  try {
    const collection = await getCollection('users')
    return await collection.findOne({ email })
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getKeywordsByClientId(clientId) {
  try {
    const collection = await getCollection('keywords')
    return await collection.find({ clientId }).toArray()
  } catch (error) {
    console.error('Error getting keywords:', error)
    throw error
  }
}

export async function getCampaignsByClientId(clientId) {
  try {
    const collection = await getCollection('kampanjer')
    return await collection.find({ clientId }).toArray()
  } catch (error) {
    console.error('Error getting campaigns:', error)
    throw error
  }
}

export async function logKeywordChange(keywordId, oldStatus, newStatus) {
  try {
    const collection = await getCollection('changeLogs')
    return await collection.insertOne({
      keywordId,
      oldStatus,
      newStatus,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Error logging keyword change:', error)
    throw error
  }
} 