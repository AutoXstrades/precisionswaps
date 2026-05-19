const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const email = process.env.TEST_CUSTOMER_EMAIL;
const password = process.env.TEST_CUSTOMER_PASSWORD;

function mergeCookies(existing, response) {
  const setCookie = response.headers.get("set-cookie");

  if (!setCookie) {
    return existing;
  }

  const nextCookies = new Map(
    existing
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...value] = cookie.split("=");
        return [name, value.join("=")];
      }),
  );

  for (const rawCookie of setCookie.split(/,(?=\s*[^;,]+=[^;,]+)/)) {
    const [pair] = rawCookie.trim().split(";");
    const [name, ...value] = pair.split("=");
    nextCookies.set(name, value.join("="));
  }

  return Array.from(nextCookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

if (!email || !password) {
  console.error(
    "Set TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD before running verify:agent-chat.",
  );
  process.exit(1);
}

let cookie = "";

const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
cookie = mergeCookies(cookie, csrfResponse);

if (!csrfResponse.ok) {
  console.error(`Unable to fetch CSRF token. Status: ${csrfResponse.status}`);
  process.exit(1);
}

const csrf = await csrfResponse.json();
const loginBody = new URLSearchParams({
  csrfToken: csrf.csrfToken,
  email,
  password,
  callbackUrl: `${baseUrl}/dashboard`,
  json: "true",
});

const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookie,
  },
  body: loginBody,
  redirect: "manual",
});
cookie = mergeCookies(cookie, loginResponse);

if (![200, 302].includes(loginResponse.status)) {
  console.error(`Customer login failed. Status: ${loginResponse.status}`);
  process.exit(1);
}

const chatResponse = await fetch(`${baseUrl}/api/agent/ls-specialist`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookie,
  },
  body: JSON.stringify({
    message: "What is a good reliable daily LS swap setup?",
  }),
});

const chatJson = await chatResponse.json().catch(() => null);

if (!chatResponse.ok || !chatJson?.reply) {
  console.error(
    `Agent chat verification failed. Status: ${chatResponse.status}.`,
  );
  process.exit(1);
}

console.log("Agent chat verification passed.");
