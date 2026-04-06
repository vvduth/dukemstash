import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2Client, R2_BUCKET, validateFile } from "@/lib/r2";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPro = session.user.isPro || process.env.BYPASS_PRO_CHECKS === "true";
  if (!isPro) {
    return NextResponse.json(
      { error: "File uploads require a Pro subscription" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemType = formData.get("itemType") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (itemType !== "image" && itemType !== "file") {
    return NextResponse.json(
      { error: "itemType must be 'image' or 'file'" },
      { status: 400 }
    );
  }

  const validationError = validateFile(
    { name: file.name, size: file.size, type: file.type },
    itemType
  );
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const key = `${session.user.id}/${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
  });
}
