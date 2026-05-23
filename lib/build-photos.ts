export const nonMainBuildPhotoFields = [
  "engineBayPhoto",
  "engineFrontPhoto",
  "engineLeftPhoto",
  "engineRightPhoto",
  "engineTopInjectorsPhoto",
  "transmissionPhoto",
  "ecmTagPhoto",
] as const;

export const buildPhotoFields = ["mainVehiclePhoto", ...nonMainBuildPhotoFields] as const;

export type BuildPhotoField = (typeof buildPhotoFields)[number];
export type NonMainBuildPhotoField = (typeof nonMainBuildPhotoFields)[number];

export type StoredBuildPhoto = {
  filename: string;
  uploadedAt: string;
  dataUrl: string;
};

export type BuildPhotoMetadata = {
  type: "build_photo_metadata";
  mainVehiclePhoto?: StoredBuildPhoto;
} & Partial<Record<NonMainBuildPhotoField, StoredBuildPhoto>>;

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const maxBuildPhotoBytes = 2 * 1024 * 1024;

export function isBuildPhotoField(value: string): value is BuildPhotoField {
  return buildPhotoFields.includes(value as BuildPhotoField);
}

export function getBuildPhotoExtension(mimeType: string) {
  return allowedMimeTypes.get(mimeType) ?? null;
}

export function parseBuildPhotoMetadata(content: string): BuildPhotoMetadata | null {
  try {
    const parsed = JSON.parse(content) as Partial<BuildPhotoMetadata>;

    if (parsed.type !== "build_photo_metadata") {
      return null;
    }

    return parsed as BuildPhotoMetadata;
  } catch {
    return null;
  }
}

export function getLatestMainVehiclePhoto(
  logs: Array<{ content: string; createdAt: Date }>,
) {
  for (const log of logs) {
    const metadata = parseBuildPhotoMetadata(log.content);

    if (metadata?.mainVehiclePhoto?.dataUrl) {
      return metadata.mainVehiclePhoto;
    }
  }

  return null;
}