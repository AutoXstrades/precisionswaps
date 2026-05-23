import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const downloads: Record<string, { fileName: string; downloadName: string }> = {
  "96-98-gm-truck-suv": {
    fileName: "psc-96-98-gm-truck-parts-list.pdf",
    downloadName: "PSC-96-98-GM-Truck-SUV-Parts-List.pdf",
  },
};

type PartsDownloadRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: PartsDownloadRouteProps) {
  const { slug } = await params;
  const download = downloads[slug];

  if (!download) {
    return NextResponse.json({ error: "Parts list not found." }, { status: 404 });
  }

  const filePath = join(
    process.cwd(),
    "public",
    "documents",
    download.fileName,
  );
  const file = await readFile(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${download.downloadName}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
