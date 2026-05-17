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
    summary: [
      `${vehicle || "Vehicle"} planned as a ${goal} swap.`,
      `Engine/trans status: ${intake.engineStatus}.`,
      `Preferences: ${intake.preferences.length ? intake.preferences.join(", ") : "standard LS-focused setup"}.`,
      intake.notes ? `Notes: ${intake.notes}.` : "Notes: confirm drivetrain, wiring, mounts, cooling, exhaust, and fuel system before scheduling.",
      `Estimated working range: $${estimateMin.toLocaleString()}-$${estimateMax.toLocaleString()}.`,
    ].join("\n"),
    estimateMin,
    estimateMax,
  };
}

export async function askOpenAiForSpecialistResult(
  intake: BuildIntake,
): Promise<SpecialistResult> {
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackSpecialistResult(intake);
  }

  const fallback = getFallbackSpecialistResult(intake);
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
            "You are the PrecisionSwaps.co LS Swap Specialist. Return strict JSON with nextQuestion, explanation, summary, estimateMin, estimateMax. Be practical, concise, and shop-ready. Estimates are whole USD numbers.",
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

  try {
    const parsed = JSON.parse(content) as Partial<SpecialistResult>;

    return {
      nextQuestion: parsed.nextQuestion || fallback.nextQuestion,
      explanation: parsed.explanation || fallback.explanation,
      summary: parsed.summary || fallback.summary,
      estimateMin: Number(parsed.estimateMin) || fallback.estimateMin,
      estimateMax: Number(parsed.estimateMax) || fallback.estimateMax,
    };
  } catch {
    return fallback;
  }
}
