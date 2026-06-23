import RegisterForm from "./RegisterForm";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar SPMB Online - SMP Bina Harapan Jatigede",
};

export default async function RegisterPage() {
  const spmbSetting = await prisma.systemSetting.findUnique({ where: { key: "SPMB_IS_OPEN" } });
  const isOpen = spmbSetting ? spmbSetting.value !== "false" : true; // Default true if not set

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Formulir Pendaftaran Siswa Baru</h1>
        {isOpen ? (
          <p className="text-slate-500 mt-2">Lengkapi data di bawah ini dengan benar.</p>
        ) : (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Pendaftaran Ditutup</h2>
            <p className="text-red-600">Mohon maaf, pendaftaran siswa baru SPMB saat ini sedang tidak dibuka. Silakan kembali lagi nanti atau hubungi pihak sekolah untuk informasi lebih lanjut.</p>
          </div>
        )}
      </div>
      {isOpen && <RegisterForm />}
    </div>
  );
}
