import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const fullName = formData.get("fullName");
    const birthDate = formData.get("birthDate");
    const birthPlace = formData.get("birthPlace");
    const gender = formData.get("gender");
    const address = formData.get("address");
    const previousSchool = formData.get("previousSchool");
    const parentName = formData.get("parentName");
    const parentPhone = formData.get("parentPhone");

    const kkFile = formData.get("kkFile");
    const aktaFile = formData.get("aktaFile");
    const ijazahFile = formData.get("ijazahFile");

    if (!fullName || !birthDate || !address) {
      return NextResponse.json({ success: false, error: "Data wajib (Nama, Tanggal Lahir, Alamat) tidak boleh kosong" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/spmb");
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const saveFile = async (file, prefix) => {
      if (!file || typeof file === "string") return null;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${prefix}-${Date.now()}-${file.name.replace(/\\s+/g, '_')}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      return `/uploads/spmb/${filename}`;
    };

    const kkUrl = await saveFile(kkFile, "kk");
    const aktaUrl = await saveFile(aktaFile, "akta");
    const ijazahUrl = await saveFile(ijazahFile, "ijazah");

    const documents = {
      kk: kkUrl,
      akta: aktaUrl,
      ijazah: ijazahUrl
    };

    const spmb = await prisma.spmbRegistration.create({
      data: {
        fullName,
        birthDate: new Date(birthDate),
        birthPlace,
        gender,
        address,
        previousSchool,
        parentName,
        parentPhone,
        documents,
      },
    });

    return NextResponse.json({ success: true, data: { id: spmb.id } });
  } catch (error) {
    console.error("SPMB register error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan internal pada server" }, { status: 500 });
  }
}
