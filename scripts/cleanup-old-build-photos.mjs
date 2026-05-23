import { access, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NON_MAIN_PHOTO_FIELDS = [
  "engineBayPhoto",
  "engineFrontPhoto",
  "engineLeftPhoto",
  "engineRightPhoto",
  "engineTopInjectorsPhoto",
  "transmissionPhoto",
  "ecmTagPhoto",
];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isExpired(uploadedAt, now) {
  const uploadedTime = Date.parse(uploadedAt);

  if (Number.isNaN(uploadedTime)) {
    return false;
  }

  return now.getTime() - uploadedTime > THIRTY_DAYS_MS;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function cleanupOldBuildPhotos({
  uploadsRoot = path.join(process.cwd(), "public", "uploads", "builds"),
  now = new Date(),
} = {}) {
  const summary = {
    uploadsRoot,
    scannedBuildFolders: 0,
    updatedMetadataFiles: 0,
    deletedFiles: [],
    skipped: [],
  };

  if (!(await exists(uploadsRoot))) {
    return summary;
  }

  const buildFolders = await readdir(uploadsRoot, { withFileTypes: true });

  for (const buildFolder of buildFolders) {
    if (!buildFolder.isDirectory()) {
      continue;
    }

    summary.scannedBuildFolders += 1;
    const buildDir = path.join(uploadsRoot, buildFolder.name);
    const metadataPath = path.join(buildDir, "photo-metadata.json");

    if (!(await exists(metadataPath))) {
      summary.skipped.push({ buildId: buildFolder.name, reason: "metadata_missing" });
      continue;
    }

    let metadata;

    try {
      metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    } catch {
      summary.skipped.push({ buildId: buildFolder.name, reason: "metadata_invalid" });
      continue;
    }

    if (!isObject(metadata)) {
      summary.skipped.push({ buildId: buildFolder.name, reason: "metadata_not_object" });
      continue;
    }

    let metadataChanged = false;

    for (const field of NON_MAIN_PHOTO_FIELDS) {
      const photoEntry = metadata[field];

      if (!isObject(photoEntry) || typeof photoEntry.filename !== "string") {
        continue;
      }

      if (typeof photoEntry.uploadedAt !== "string" || !isExpired(photoEntry.uploadedAt, now)) {
        continue;
      }

      const safeFilename = path.basename(photoEntry.filename);
      const photoPath = path.join(buildDir, safeFilename);

      try {
        if (await exists(photoPath)) {
          await unlink(photoPath);
          summary.deletedFiles.push(path.relative(process.cwd(), photoPath));
        }

        delete metadata[field];
        metadataChanged = true;
      } catch (error) {
        summary.skipped.push({
          buildId: buildFolder.name,
          field,
          reason: error instanceof Error ? error.message : "delete_failed",
        });
      }
    }

    if (metadataChanged) {
      await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
      summary.updatedMetadataFiles += 1;
    }
  }

  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cleanupOldBuildPhotos()
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
    })
    .catch((error) => {
      console.error(
        JSON.stringify(
          {
            error: error instanceof Error ? error.message : "cleanup_failed",
          },
          null,
          2,
        ),
      );
      process.exitCode = 1;
    });
}