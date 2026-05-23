import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  buildPhotoFields,
  getBuildPhotoExtension,
  maxBuildPhotoBytes,
  type BuildPhotoField,
  type BuildPhotoMetadata,
  type NonMainBuildPhotoField,
} from "@/lib/build-photos";
import { requireCustomer } from "@/lib/customer";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

function createPhotoFilename(field: BuildPhotoField, extension: string) {
  return `${field}-${Date.now()}-${randomUUID()}.${extension}`;
}

async function fileToStoredPhoto(field: BuildPhotoField, file: File) {
  const extension = getBuildPhotoExtension(file.type);

  if (!extension) {
    return {
      error: `${field} must be a JPEG, PNG, or WebP image.`,
      photo: null,
    };
  }

  if (file.size > maxBuildPhotoBytes) {
    return {
      error: `${field} must be 2 MB or smaller.`,
      photo: null,
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = createPhotoFilename(field, extension);

  return {
    error: null,
    photo: {
      filename,
      uploadedAt: new Date().toISOString(),
      dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`,
    },
  };
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireCustomer();
  const { id: buildId } = await context.params;
  const build = await prisma.build.findFirst({
    where: { id: buildId, userId: session.user.id },
    select: { id: true },
  });

  if (!build) {
    return NextResponse.json({ error: "Build not found." }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Photo uploads must use multipart/form-data." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const metadata: BuildPhotoMetadata = { type: "build_photo_metadata" };
  const uploaded: Partial<Record<BuildPhotoField, string>> = {};

  for (const field of buildPhotoFields) {
    const file = formData.get(field);

    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const { error, photo } = await fileToStoredPhoto(field, file);

    if (error || !photo) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (field === "mainVehiclePhoto") {
      metadata.mainVehiclePhoto = photo;
    } else {
      metadata[field as NonMainBuildPhotoField] = photo;
    }

    uploaded[field] = photo.dataUrl;
  }

  if (!Object.keys(uploaded).length) {
    return NextResponse.json({ error: "No valid photo files were uploaded." }, { status: 400 });
  }

  await prisma.agentLog.create({
    data: {
      userId: session.user.id,
      buildId,
      role: "system",
      content: JSON.stringify(metadata),
    },
  });

  return NextResponse.json({ uploaded });
}