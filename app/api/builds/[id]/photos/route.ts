import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";

const nonMainPhotoFields = [
  "engineBayPhoto",
  "engineFrontPhoto",
  "engineLeftPhoto",
  "engineRightPhoto",
  "engineTopInjectorsPhoto",
  "transmissionPhoto",
  "ecmTagPhoto",
] as const;
const allowedPhotoFields = ["mainVehiclePhoto", ...nonMainPhotoFields] as const;
const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type AllowedPhotoField = (typeof allowedPhotoFields)[number];
type PhotoMetadata = {
  mainVehiclePhoto?: string;
} & Partial<Record<(typeof nonMainPhotoFields)[number], { filename: string; uploadedAt: string }>>;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

function getBuildUploadDir(buildId: string) {
  return path.join(process.cwd(), "public", "uploads", "builds", buildId);
}

function getPublicPhotoPath(buildId: string, filename: string) {
  return `/uploads/builds/${buildId}/${filename}`;
}

async function readMetadata(metadataPath: string): Promise<PhotoMetadata> {
  try {
    return JSON.parse(await readFile(metadataPath, "utf8")) as PhotoMetadata;
  } catch {
    return {};
  }
}

function isAllowedPhotoField(value: string): value is AllowedPhotoField {
  return allowedPhotoFields.includes(value as AllowedPhotoField);
}

function createPhotoFilename(field: AllowedPhotoField, file: File) {
  const extension = allowedMimeTypes.get(file.type);

  if (!extension) {
    return null;
  }

  return `${field}-${Date.now()}-${randomUUID()}.${extension}`;
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireCustomer();
  const { id: buildId } = await context.params;
  const build = await prisma.build.findFirst({
    where: { id: buildId, userId: session.user.id },
    select: { id: true },
  });

  if (!build) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  const request = _request;
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Photo uploads must use multipart/form-data." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const uploadDir = getBuildUploadDir(buildId);
  const metadataPath = path.join(uploadDir, "photo-metadata.json");
  const metadata = await readMetadata(metadataPath);
  const uploaded: Partial<Record<AllowedPhotoField, string>> = {};

  await mkdir(uploadDir, { recursive: true });

  for (const field of allowedPhotoFields) {
    const file = formData.get(field);

    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const filename = createPhotoFilename(field, file);

    if (!filename) {
      return NextResponse.json(
        { error: `${field} must be a JPEG, PNG, or WebP image.` },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);

    if (field === "mainVehiclePhoto") {
      metadata.mainVehiclePhoto = filename;
    } else {
      metadata[field] = {
        filename,
        uploadedAt: new Date().toISOString(),
      };
    }

    uploaded[field] = getPublicPhotoPath(buildId, filename);
  }

  if (!Object.keys(uploaded).length) {
    return NextResponse.json({ error: "No valid photo files were uploaded." }, { status: 400 });
  }

  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

  return NextResponse.json({ uploaded, metadataPath: getPublicPhotoPath(buildId, "photo-metadata.json") });
}