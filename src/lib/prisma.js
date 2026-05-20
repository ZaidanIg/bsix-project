import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

// Bypassing self-signed certificate issues in Vercel/Managed DB environments
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const caCert = process.env.DATABASE_CA_CERT;

  // Handle missing connection string gracefully, especially during build time
  if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn("DATABASE_URL is not defined in environment variables. Database connections will fail.");
    }
    // Return a dummy client or let Prisma handle the missing URL (it will throw on first query)
    return new PrismaClient();
  }

  try {
    const dbUrl = new URL(connectionString);
    const hasSslRootCert = dbUrl.searchParams.has('sslrootcert');
    
    // Always remove sslrootcert and sslmode from URL to prevent pg-connection-string from overriding custom SSL config
    dbUrl.searchParams.delete('sslrootcert');
    dbUrl.searchParams.delete('sslmode');

    let poolConfig = {
      connectionString: dbUrl.toString(),
      max: 2, // Limit connections per Vercel function instance
      idleTimeoutMillis: 3000, // Close idle connections quickly
      connectionTimeoutMillis: 15000, // Memberi waktu lebih lama untuk koneksi awal
    };

    if (caCert || hasSslRootCert) {
      let caContent = caCert;
      
      if (!caContent && hasSslRootCert) {
        try {
          const fs = require('fs');
          const path = require('path');
          const caPath = path.join(process.cwd(), 'ca.pem');
          if (fs.existsSync(caPath)) {
            caContent = fs.readFileSync(caPath, 'utf8');
          }
        } catch (fsErr) {
          logger.warn(`Could not read ca.pem: ${fsErr.message}`);
        }
      }

      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
      
      if (caContent) {
        poolConfig.ssl.ca = caContent.trim().replace(/\\n/g, '\n');
      }
    } else {
      // Basic SSL fallback
      const sslMode = dbUrl.searchParams.get('sslmode');
      const sslEnabled = dbUrl.searchParams.get('ssl');
      
      if (sslMode === 'require' || sslMode === 'prefer' || sslEnabled === 'true') {
        poolConfig.ssl = { rejectUnauthorized: false };
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.info("Prisma Pool Config SSL initialized", { 
        ...poolConfig.ssl, 
        ca: poolConfig.ssl?.ca ? "[PRESENT]" : "[MISSING]" 
      });
    }

    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (err) {
    logger.error("Error initializing Prisma Client", err);
    return new PrismaClient(); // Final fallback
  }
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
