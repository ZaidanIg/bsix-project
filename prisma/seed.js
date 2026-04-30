const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Bypassing self-signed certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Seed 6 pilar B'Six
  const pilars = [
    { code: 'BSMART', name: "B'Smart", description: "Pembentukan karakter (soft skills) dan kompetensi kepemimpinan siswa melalui kegiatan keagamaan, konseling, LDKS, dan kepramukaan.", icon: 'brain', colorHex: '#4f7cff' },
    { code: 'BGREEN', name: "B'Green", description: "Konservasi lingkungan dan pelestarian tanaman lokal dengan pendekatan ekologi dan pertanian regeneratif.", icon: 'leaf', colorHex: '#22c55e' },
    { code: 'BLIFE',  name: "B'Life",  description: "Pelatihan keterampilan teknis pertanian modern: kultur jaringan, teknik belah bonggol untuk perbanyakan bibit.", icon: 'seedling', colorHex: '#f59e0b' },
    { code: 'BFUN',   name: "B'Fun",   description: "Pembelajaran menyenangkan melalui agroekoeduwisata, Fun Mini Garden, Festival Budaya Sunda.", icon: 'star', colorHex: '#ec4899' },
    { code: 'BPOINS', name: "B'Poins & Coin", description: "Penguasaan IPTEK, literasi digital, penyusunan KTI, dan dokumentasi kegiatan melalui media digital.", icon: 'coin', colorHex: '#8b5cf6' },
    { code: 'BMART',  name: "B'Mart",  description: "Pengembangan jiwa kewirausahaan (sociopreneurship): mengelola hasil pertanian dan memasarkan produk olahan.", icon: 'store', colorHex: '#f97316' },
  ]

  console.log('Seeding pilars...')
  for (const pilar of pilars) {
    await prisma.pilarBSix.upsert({ where: { code: pilar.code }, update: {}, create: pilar })
  }

  // 2. Seed akun admin default
  const adminPassword = await bcrypt.hash('Admin@BMSF2025', 10)
  await prisma.user.upsert({
    where: { nisNip: 'ADMIN001' },
    update: {},
    create: { 
      nisNip: 'ADMIN001', 
      name: 'Administrator', 
      email: 'admin@smpbinaharapan.sch.id', 
      password: adminPassword, 
      role: 'ADMIN' 
    }
  })

  // 3. Seed akun Siswa default
  const studentPassword = await bcrypt.hash('Siswa@BMSF2025', 10)
  await prisma.user.upsert({
    where: { nisNip: '21221001' },
    update: {},
    create: {
      nisNip: '21221001',
      name: 'Budi Siswanto',
      email: 'budi@student.com',
      password: studentPassword,
      role: 'SISWA'
    }
  })

  // 4. Seed akun Guru default
  const teacherPassword = await bcrypt.hash('Guru@BMSF2025', 10)
  const teacherUser = await prisma.user.upsert({
    where: { nisNip: '19850101001' },
    update: {},
    create: {
      nisNip: '19850101001',
      name: 'Ibu Pertiwi, S.Pd',
      email: 'pertiwi@teacher.com',
      password: teacherPassword,
      role: 'GURU'
    }
  })

  // Pastikan data Teacher juga ada
  await prisma.teacher.upsert({
    where: { nip: '19850101001' },
    update: {},
    create: {
      userId: teacherUser.id,
      nip: '19850101001',
      subject: 'Ilmu Pengetahuan Alam (Pertanian)',
      bio: 'Pendidik yang berfokus pada pengembangan agrikultur modern di lingkungan sekolah.'
    }
  })

  console.log('Seed completed successfully!')
  console.log('Default Accounts:')
  console.log('- ADMIN: ADMIN001 / Admin@BMSF2025')
  console.log('- GURU:  19850101001 / Guru@BMSF2025')
  console.log('- SISWA: 21221001 / Siswa@BMSF2025')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
