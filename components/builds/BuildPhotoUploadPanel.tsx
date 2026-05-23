"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type PhotoField = {
  name: string;
  label: string;
  helper: string;
  permanent?: boolean;
};

type BuildPhotoUploadPanelProps = {
  buildId: string;
};

const photoFields: PhotoField[] = [
  {
    name: "mainVehiclePhoto",
    label: "Main vehicle photo",
    helper: "Kept permanently",
    permanent: true,
  },
  {
    name: "engineBayPhoto",
    label: "Engine bay photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "engineFrontPhoto",
    label: "Engine front photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "engineLeftPhoto",
    label: "Engine left photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "engineRightPhoto",
    label: "Engine right photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "engineTopInjectorsPhoto",
    label: "Engine top/injectors photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "transmissionPhoto",
    label: "Transmission photo",
    helper: "Auto-deletes after 30 days",
  },
  {
    name: "ecmTagPhoto",
    label: "ECM tag photo",
    helper: "Auto-deletes after 30 days",
  },
];

export function BuildPhotoUploadPanel({ buildId }: BuildPhotoUploadPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>, fieldName: string) {
    const file = event.target.files?.[0];

    setSelectedFiles((current) => ({
      ...current,
      [fieldName]: file?.name ?? "",
    }));
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const hasFile = photoFields.some((field) => {
      const value = formData.get(field.name);
      return value instanceof File && value.size > 0;
    });

    if (!hasFile) {
      setError("Choose at least one photo to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/builds/${buildId}/photos`, {
      method: "POST",
      body: formData,
    });
    const data = (await response.json().catch(() => null)) as
      | { uploaded?: Record<string, string>; error?: string }
      | null;

    setIsUploading(false);

    if (!response.ok || !data?.uploaded) {
      setError(data?.error ?? "Photo upload failed. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setSelectedFiles({});
    setMessage(`${Object.keys(data.uploaded).length} photo upload${Object.keys(data.uploaded).length === 1 ? "" : "s"} saved.`);
  }

  return (
    <div className="neon-panel rounded-[8px] p-4 sm:p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF003C] sm:tracking-[0.22em]">
          Build photos
        </p>
        <h2 className="mt-2 text-xl font-black text-white">Add Photos</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Upload your main vehicle photo and supporting swap reference photos. The main vehicle photo is kept permanently; engine, transmission, and ECM reference photos auto-delete after 30 days.
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          {photoFields.map((field) => (
            <label
              key={field.name}
              className="block rounded-[8px] border border-white/10 bg-black/35 p-3 transition focus-within:border-[#FF003C]"
            >
              <span className="block text-sm font-black text-white">{field.label}</span>
              <span
                className={`mt-1 block text-xs font-bold uppercase tracking-[0.1em] ${
                  field.permanent ? "text-emerald-200/80" : "text-white/42"
                }`}
              >
                {field.helper}
              </span>
              <input
                type="file"
                name={field.name}
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleFileChange(event, field.name)}
                className="mt-3 block min-h-11 w-full cursor-pointer rounded-[8px] border border-white/10 bg-black/55 px-3 py-2 text-sm text-white/72 file:mr-3 file:rounded-full file:border-0 file:bg-[#FF003C] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.08em] file:text-white"
              />
              {selectedFiles[field.name] ? (
                <span className="mt-2 block truncate text-xs text-white/48">
                  {selectedFiles[field.name]}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        {error ? <p className="text-sm font-semibold text-[#FF003C]">{error}</p> : null}
        {message ? <p className="text-sm font-semibold text-emerald-200">{message}</p> : null}

        <button
          type="submit"
          disabled={isUploading}
          className="min-h-11 rounded-full bg-[#FF003C] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_0_28px_rgba(255,0,60,0.32)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          {isUploading ? "Uploading..." : "Save Photos"}
        </button>
      </form>
    </div>
  );
}