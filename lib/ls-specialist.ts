import { z } from "zod";

export const buildIntakeSchema = z.object({
  vehicleYear: z.coerce.number().int().min(1900).max(2100).optional(),
  vehicleMake: z.string().trim().min(1).optional(),
  vehicleModel: z.string().trim().min(1).optional(),
  engineStatus: z.string().trim().min(1).optional(),
  goal: z.enum(["DAILY", "STREET", "DRAG", "SHOW"]).optional(),
  preferences: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().trim().optional(),
  saveBuild: z.boolean().default(false),
});

export type BuildIntake = z.infer<typeof buildIntakeSchema>;

export const specialistChatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(1000, "Message is too long."),
  buildId: z.string().trim().min(1).optional(),
});

export type SpecialistChatInput = z.infer<typeof specialistChatSchema>;

export type SpecialistConversationContext = Array<{
  senderRole: string;
  message: string;
  createdAt: Date;
}>;

export type SpecialistResult = {
  nextQuestion: string;
  explanation: string;
  summary: string;
  estimateMin: number;
  estimateMax: number;
};

const goalLabels: Record<string, string> = {
  DAILY: "daily driver",
  STREET: "street performance",
  DRAG: "drag setup",
  SHOW: "show build",
};

function dedupeLines(value: string) {
  const seen = new Set<string>();

  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => {
      const normalized = line
        .replace(/^[-*]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim()
        .toLowerCase();

      if (!normalized) {
        return true;
      }

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .join("\n")
    .trim();
}

function recentMessagesContain(
  context: SpecialistConversationContext | undefined,
  needles: string[],
) {
  const recentText = (context ?? [])
    .map((item) => item.message.toLowerCase())
    .join("\n");

  return needles.some((needle) => recentText.includes(needle));
}

export function getFallbackSpecialistResult(intake: BuildIntake): SpecialistResult {
  const vehicle = [
    intake.vehicleYear,
    intake.vehicleMake,
    intake.vehicleModel,
  ]
    .filter(Boolean)
    .join(" ");
  const goal = intake.goal ? goalLabels[intake.goal] : "street-ready";
  const wantsLt = intake.preferences.some((item) => item.toLowerCase().includes("lt"));
  const wantsBoost = intake.preferences.some((item) => item.toLowerCase().includes("boost"));
  const wantsCam = intake.preferences.some((item) => item.toLowerCase().includes("cam"));
  const estimateMin = wantsBoost ? 10000 : wantsLt ? 9000 : wantsCam ? 8500 : 7500;
  const estimateMax = wantsBoost ? 15000 : wantsLt ? 13000 : wantsCam ? 11500 : 10000;

  if (!intake.vehicleYear || !intake.vehicleMake || !intake.vehicleModel) {
    return {
      nextQuestion: "What year, make, and model are we swapping?",
      explanation: "The vehicle platform sets the mount, oil pan, accessory drive, wiring, and clearance plan.",
      summary: "",
      estimateMin,
      estimateMax,
    };
  }

  if (!intake.engineStatus) {
    return {
      nextQuestion: "Do you already have the engine and transmission, or do they need to be sourced?",
      explanation: "Parts-on-hand builds move faster, while sourcing changes the estimate and timeline.",
      summary: "",
      estimateMin,
      estimateMax,
    };
  }

  if (!intake.goal) {
    return {
      nextQuestion: "Is the goal daily, street, drag, or show?",
      explanation: "The goal determines cam choice, converter, cooling, fuel system, and tuning priorities.",
      summary: "",
      estimateMin,
      estimateMax,
    };
  }

  return {
    nextQuestion: "Review the build ticket and save it when it looks right.",
    explanation: wantsLt
      ? "LT swaps can make strong modern power, but they usually need more wiring, fuel, and controller planning than a straightforward LS path."
      : "LS swaps remain the practical baseline because parts support, wiring options, and fitment knowledge are strong.",
    summary: dedupeLines([
      `${vehicle || "Vehicle"} planned as a ${goal} swap.`,
      `Engine/trans status: ${intake.engineStatus}.`,
      `Preferences: ${intake.preferences.length ? intake.preferences.join(", ") : "standard LS-focused setup"}.`,
      intake.notes ? `Notes: ${intake.notes}.` : "Notes: confirm drivetrain, wiring, mounts, cooling, exhaust, and fuel system before scheduling.",
      `Estimated working range: $${estimateMin.toLocaleString()}-$${estimateMax.toLocaleString()}.`,
    ].join("\n")),
    estimateMin,
    estimateMax,
  };
}

export function getFallbackSpecialistReply(
  input: SpecialistChatInput,
  context?: SpecialistConversationContext,
) {
  const message = input.message.toLowerCase();
  const alreadyCoveredCosts = recentMessagesContain(context, ["$7,500", "$7500", "estimate", "cost", "price"]);
  const alreadyCoveredLt = recentMessagesContain(context, ["lt swaps", "lt swap", "controller", "fuel system"]);

  if (message.includes("lt")) {
    return {
      reply: alreadyCoveredLt
        ? "We already covered the LT tradeoff. Short version: choose LT when the budget supports extra controller, fuel, and wiring complexity; choose LS when speed, parts support, and predictability matter most."
        : "LT swaps can make excellent power, but they usually add controller, fuel system, wiring, and parts-cost complexity compared with a straightforward LS swap. For most daily and street builds, price both paths before choosing.",
    };
  }

  if (
    message.includes("cost") ||
    message.includes("price") ||
    message.includes("estimate")
  ) {
    return {
      reply: alreadyCoveredCosts
        ? "Estimate reminder: straightforward LS builds usually target $7,500-$10,000, then move higher with cam, LT, boost, sourcing, wiring repair, or cleanup work."
        : "A typical PrecisionSwaps complete build target is $7,500-$10,000 for straightforward LS work, with cammed, LT, forced-induction, sourcing, wiring repair, and cleanup work pushing the range higher.",
    };
  }

  if (message.includes("daily") || message.includes("reliable")) {
    return {
      reply:
        "For a reliable daily, keep the combo simple: proven LS platform, conservative cam if any, clean cooling, solid fuel delivery, sorted wiring, and enough converter/transmission planning to avoid drivability problems.",
    };
  }

  return {
    reply:
      "I can help plan LS and LT swap paths, parts sourcing, wiring, goals, estimates, and build-ticket details. Send the vehicle, drivetrain status, and whether the goal is daily, street, drag, or show.",
  };
}

export async function askOpenAiForSpecialistReply(
  input: SpecialistChatInput,
  context: SpecialistConversationContext = [],
): Promise<{ reply: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackSpecialistReply(input, context);
  }

  const fallback = getFallbackSpecialistReply(input, context);

  try {
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
              "You are the PrecisionSwaps.co LS Swap Specialist. Return strict JSON with one key: reply. Keep replies concise, practical, and shop-ready. Use bullets for lists. Avoid repeating the same part, explanation, or recommendation already present in recentConversation. Never invent parts or claim a part list exists unless the official MySwap Parts List is available in the build ticket.",
          },
          {
            role: "user",
            content: JSON.stringify({
              message: input.message,
              recentConversation: context.map((item) => ({
                senderRole: item.senderRole,
                message: item.message,
              })),
              requiredShape: { reply: "string" },
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

    const parsed = JSON.parse(content) as Partial<{ reply: string }>;
    const reply = parsed.reply?.trim();

    return reply ? { reply: dedupeLines(reply) } : fallback;
  } catch {
    return fallback;
  }
}

export async function askOpenAiForSpecialistResult(
  intake: BuildIntake,
): Promise<SpecialistResult> {
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackSpecialistResult(intake);
  }

  const fallback = getFallbackSpecialistResult(intake);

  try {
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
              "You are the PrecisionSwaps.co LS Swap Specialist. Return strict JSON with nextQuestion, explanation, summary, estimateMin, estimateMax. Be practical, concise, and shop-ready. Estimates are whole USD numbers. Do not repeat the same part or explanation. Never invent parts. Direct customers to the official MySwap Parts List for platform-specific parts PDFs.",
          },
          {
            role: "user",
            content: JSON.stringify({
              intake,
              requiredShape: {
                nextQuestion: "string",
                explanation: "string",
                summary: "string",
                estimateMin: "number",
                estimateMax: "number",
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

    const parsed = JSON.parse(content) as Partial<SpecialistResult>;

    return {
      nextQuestion: parsed.nextQuestion || fallback.nextQuestion,
      explanation: dedupeLines(parsed.explanation || fallback.explanation),
      summary: dedupeLines(parsed.summary || fallback.summary),
      estimateMin: Number(parsed.estimateMin) || fallback.estimateMin,
      estimateMax: Number(parsed.estimateMax) || fallback.estimateMax,
    };
  } catch {
    return fallback;
  }
}