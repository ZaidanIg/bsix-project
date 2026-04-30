import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const caCert = process.env.DATABASE_CA_CERT;

  if (caCert) {
    try {
      const dbUrl = new URL(connectionString);
      dbUrl.searchParams.delete('sslrootcert');
      
      const poolConfig = {
        connectionString: dbUrl.toString(),
        ssl: {
          // Set ke false untuk menangani sertifikat self-signed Aiven di environment serverless
          rejectUnauthorized: false, 
          ca: caCert.trim().replace(/\\n/g, '\n'),
        }
      };

      const pool = new Pool(poolConfig);
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (err) {
      console.error("Error parsing DATABASE_URL:", err);
    }
  }

  // Fallback jika tidak ada CA cert
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
