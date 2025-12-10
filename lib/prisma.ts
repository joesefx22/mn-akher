import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })
}

// Add middleware for soft delete
prisma.$use(async (params, next) => {
  // Soft delete middleware
  if (params.action === 'delete') {
    // Delete queries should be changed to updates
    params.action = 'update'
    params.args.data = { ...params.args.data, deletedAt: new Date() }
  }
  
  if (params.action === 'deleteMany') {
    // Delete many queries
    params.action = 'updateMany'
    if (params.args.data !== undefined) {
      params.args.data.deletedAt = new Date()
    } else {
      params.args.data = { deletedAt: new Date() }
    }
  }
  
  // Filter out soft deleted records
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    // Add filter for deletedAt
    params.args.where = { ...params.args.where, deletedAt: null }
  }
  
  if (params.action === 'findMany') {
    // Add filter for deletedAt
    if (params.args.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null
      }
    } else {
      params.args.where = { deletedAt: null }
    }
  }
  
  return next(params)
})

// Connection handling
let isConnected = false

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing database connection')
    return prisma
  }

  try {
    await prisma.$connect()
    isConnected = true
    console.log('Connected to database successfully')
    return prisma
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectFromDatabase() {
  if (!isConnected) return
  
  try {
    await prisma.$disconnect()
    isConnected = false
    console.log('Disconnected from database')
  } catch (error) {
    console.error('Error disconnecting from database:', error)
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  message: string
  timestamp: Date
}> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      healthy: true,
      message: 'Database is healthy',
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
