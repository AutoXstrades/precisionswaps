const baseUrl =
  process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://127.0.0.1:3000";

async function checkRedirect(path, expectedLocationPart) {
  const response = await fetch(new URL(path, baseUrl), {
    method: "GET",
    redirect: "manual",
  });
  const location = response.headers.get("location") ?? "";

  if (![302, 303, 307, 308].includes(response.status)) {
    throw new Error(`${path} expected redirect, received ${response.status}`);
  }

  if (!location.includes(expectedLocationPart)) {
    throw new Error(
      `${path} expected redirect containing ${expectedLocationPart}, received ${location}`,
    );
  }

  console.info(`${path} redirects to ${location}`);
}

async function checkUnauthorizedApi(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);

  if (response.status !== 401) {
    throw new Error(`${path} expected 401, received ${response.status}`);
  }

  console.info(`${path} rejects unauthenticated requests`);
}

await checkRedirect("/dashboard", "/login");
await checkRedirect("/builds/test-build/edit", "/login");
await checkRedirect("/admin/dashboard", "/admin");
await checkRedirect("/admin/agents/test-agent", "/admin");
await checkUnauthorizedApi("/api/agent/ls-specialist", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
await checkUnauthorizedApi("/api/admin/clawbot/supervisor", {
  method: "POST",
});

console.info("Auth routing verification complete.");
