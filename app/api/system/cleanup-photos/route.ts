import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { withApiHandler } from "@/lib/api-handler";
import { log } from "@/lib/log";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

export const POST = withApiHandler(async () => {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const scriptPath = path.join(process.cwd(), "scripts", "cleanup-old-build-photos.mjs");
  log.info("Build photo cleanup started");

  const { stdout, stderr } = await execFileAsync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    windowsHide: true,
    timeout: 60_000,
    maxBuffer: 1024 * 1024,
  });

  if (stderr.trim()) {
    log.warn("Build photo cleanup completed with stderr", { stderr: stderr.trim() });
  }

  const summary = JSON.parse(stdout || "{}");
  log.info("Build photo cleanup completed", {
    deletedCount: Array.isArray(summary.deletedFiles) ? summary.deletedFiles.length : 0,
  });

  return NextResponse.json({ ok: true, summary });
});

export const GET = POST;