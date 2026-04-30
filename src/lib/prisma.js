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
    const dbUrl = new URL(connectionString);
    const hasSslRootCert = dbUrl.searchParams.has('sslrootcert');
    
    // Always remove sslrootcert from URL to prevent pg from trying to read a local file
    dbUrl.searchParams.delete('sslrootcert');

    let poolConfig = {
      connectionString: dbUrl.toString(),
    };

    if (caCert || hasSslRootCert) {
      // If we have a cert in ENV or the URL originally asked for one
      let caContent = caCert;
      
      // Try to read ca.pem if caCert is not in ENV but was in URL
      if (!caContent && hasSslRootCert) {
        try {
          const fs = require('fs');
          const path = require('path');
          const caPath = path.join(process.cwd(), 'ca.pem');
          if (fs.existsSync(caPath)) {
            caContent = fs.readFileSync(caPath, 'utf8');
          }
        } catch (fsErr) {
          console.warn("Warning: Could not read ca.pem from filesystem:", fsErr.message);
        }
      }

      poolConfig.ssl = {
        rejectUnauthorized: false, // Maintain compatibility with managed DBs
        ...(caContent ? { ca: caContent.trim().replace(/\\n/g, '\n') } : {})
      };
    } else {
      // Basic SSL fallback
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
