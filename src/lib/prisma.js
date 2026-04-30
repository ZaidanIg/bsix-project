import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const caCert = process.env.DATABASE_CA_CERT;

  // Handle missing connection string gracefully, especially during build time
  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
      console.warn("Warning: DATABASE_URL is not defined in environment variables. Database connections will fail.");
    }
    // Return a dummy client or let Prisma handle the missing URL (it will throw on first query)
    return new PrismaClient();
  }

  try {
    let poolConfig = {
      connectionString: connectionString,
    };

    if (caCert) {
      // Remove any search params that might conflict with manual SSL config
      const dbUrl = new URL(connectionString);
      dbUrl.searchParams.delete('sslrootcert');
      
      poolConfig = {
        connectionString: dbUrl.toString(),
        ssl: {
          rejectUnauthorized: false, // Often required for managed databases
          ca: caCert.trim().replace(/\\n/g, '\n'),
        }
      };
    } else {
      // Fallback for connections that might need SSL but don't provide a CA cert
      // (Common for Neon/Supabase with ?sslmode=require)
      const dbUrl = new URL(connectionString);
      if (dbUrl.searchParams.get('sslmode') === 'require' || dbUrl.searchParams.get('ssl') === 'true') {
        poolConfig.ssl = { rejectUnauthorized: false };
      }
    }

    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (err) {
    console.error("Critical: Error initializing Prisma Client:", err.message);
    return new PrismaClient(); // Final fallback
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
