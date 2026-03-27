import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2Client, R2_BUCKET } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  // Decode the key (it comes URL-encoded from the path)
  const decodedKey = decodeURIComponent(key);

  try {
    const response = await r2Client.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: decodedKey })
    );

    const body = response.Body;
    if (!body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const bytes = await body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": response.ContentType ?? "application/octet-stream",
        "Content-Length": String(response.ContentLength ?? bytes.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
