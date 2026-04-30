import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Daftar SPMB Online - SMP Bina Harapan Jatigede",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Formulir Pendaftaran Siswa Baru</h1>
        <p className="text-slate-500 mt-2">Lengkapi data di bawah ini dengan benar.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
