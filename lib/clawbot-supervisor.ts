import type { Build, User } from "@prisma/client";

type BuildWithUser = Build & {
  user: Pick<User, "email">;
};

export type ClawbotReportResult = {
  title: string;
  report: string;
};

function summarizeGoalCounts(builds: BuildWithUser[]) {
  return builds.reduce<Record<string, number>>((counts, build) => {
    counts[build.goal] = (counts[build.goal] ?? 0) + 1;
    return counts;
  }, {});
}

export function getFallbackClawbotReport(builds: BuildWithUser[]): ClawbotReportResult {
  const goalCounts = summarizeGoalCounts(builds);
  const recentBuilds = builds.slice(0, 5);
  const goalSummary = Object.entries(goalCounts)
    .map(([goal, count]) => `${goal.toLowerCase()}: ${count}`)
    .join(", ");
  const recentSummary = recentBuilds.length
    ? recentBuilds
        .map(
          (build, index) =>
            `${index + 1}. ${build.vehicleYear} ${build.vehicleMake} ${build.vehicleModel} for ${build.user.email} (${build.goal.toLowerCase()})`,
        )
        .join("\n")
    : "No builds have been created yet.";

  return {
    title: "Clawbot Supervisor Build Report",
    report: [
      `Total builds reviewed: ${builds.length}.`,
      `Build goal mix: ${goalSummary || "no goals captured yet"}.`,
      "Recent builds:",
      recentSummary,
      "Recommended owner follow-up: review incomplete notes, confirm sourced drivetrain needs, and prioritize builds with boost or LT preferences for deeper parts planning.",
    ].join("\n"),
  };
}

export async function generateClawbotSupervisorReport(
  builds: BuildWithUser[],
): Promise<ClawbotReportResult> {
  const fallback = getFallbackClawbotReport(builds);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the Clawbot Supervisor for PrecisionSwaps.co. Return strict JSON with title and report. Summarize build trends, common vehicles/goals, missing info, and owner follow-ups. Keep it concise and operational.",
        },
        {
          role: "user",
          content: JSON.stringify({
            builds: builds.map((build) => ({
              customer: build.user.email,
              vehicle: `${build.vehicleYear} ${build.vehicleMake} ${build.vehicleModel}`,
              engineStatus: build.engineStatus,
              goal: build.goal,
              notes: build.notes,
              estimateMin: build.estimateMin,
              estimateMax: build.estimateMax,
              createdAt: build.createdAt,
            })),
            requiredShape: {
              title: "string",
              report: "string",
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return fallback;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(content) as Partial<ClawbotReportResult>;

    return {
      title: parsed.title || fallback.title,
      report: parsed.report || fallback.report,
    };
  } catch {
    return fallback;
  }
}
