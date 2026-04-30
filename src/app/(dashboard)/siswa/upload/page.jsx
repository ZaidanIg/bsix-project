import prisma from "@/lib/prisma";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const pilars = await prisma.pilarBSix.findMany();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upload B'Voice</h1>
        <p className="text-slate-500 mt-2">Submit portofolio kegiatan B'Six Anda di sini.</p>
      </div>
      <UploadForm pilars={pilars} />
    </div>
  );
}
