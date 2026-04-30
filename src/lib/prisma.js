import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const caCert = process.env.DATABASE_CA_CERT;

  const poolConfig = { connectionString };

  if (caCert) {
    // Bersihkan URL dari parameter sslrootcert agar tidak mencari file fisik
    const cleanUrl = connectionString.split('&sslrootcert=')[0].split('?sslrootcert=')[0];
    poolConfig.connectionString = cleanUrl;
    
    poolConfig.ssl = {
      rejectUnauthorized: true,
      ca: caCert.trim().replace(/\\n/g, '\n'),
    };
  }

  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
