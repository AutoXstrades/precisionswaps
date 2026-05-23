"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Platform = {
  id: string;
  label: string;
  modalTitle: string;
  imageSrc: string;
  imageAlt: string;
  pdfSrc: string;
  downloadSrc: string;
};

const platforms: Platform[] = [
  {
    id: "96-98-gm-truck-suv",
    label: "96-98 GM Truck/SUV",
    modalTitle: "96-98 GM Truck/SUV LS Swap Parts List",
    imageSrc: "/images/96-98-gm-truck.jpeg",
    imageAlt: "Black 96-98 GM truck platform",
    pdfSrc: "/documents/psc-96-98-gm-truck-parts-list.pdf",
    downloadSrc: "/api/parts/download/96-98-gm-truck-suv",
  },
];

function PartsListModal({
  activePlatform,
  onClose,
  onSelectPlatform,
}: {
  activePlatform: Platform | null;
  onClose: () => void;
  onSelectPlatform?: (platform: Platform) => void;
}) {
  if (!activePlatform && !onSelectPlatform) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parts-modal-title"
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/72 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-[8px] border border-[#FF003C]/35 bg-[#08080f] shadow-[0_0_70px_rgba(255,0,60,0.24)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FF003C]">
              Platform parts list
            </p>
            <h2
              id="parts-modal-title"
              className="mt-2 text-xl font-black text-white sm:text-2xl"
            >
              {activePlatform
                ? activePlatform.modalTitle
                : "MySwap Parts Lists"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close parts list"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/15 text-2xl leading-none text-white/70 transition hover:border-[#FF003C]/70 hover:text-white"
          >
            X
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {activePlatform ? (
            <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black">
              <iframe
                title={`${activePlatform.label} parts list page 1`}
                src={`${activePlatform.pdfSrc}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                className="h-[70svh] min-h-[28rem] w-full bg-white"
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => onSelectPlatform?.(platform)}
                  className="group overflow-hidden rounded-[8px] border border-white/10 bg-black/45 text-left transition hover:border-[#FF003C]/60"
                >
                  <span className="relative block aspect-[4/3] bg-black">
                    <Image
                      src={platform.imageSrc}
                      alt={platform.imageAlt}
                      fill
                      className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </span>
                  <span className="block border-t border-white/10 px-5 py-4">
                    <span className="block text-lg font-black text-white">
                      {platform.label}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-white/52">
                      Open parts list
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm leading-6 text-white/56">
            {activePlatform
              ? "Viewer opens to page 1 only. Download keeps the original PDF file."
              : "Choose a completed platform to view its LS swap parts list."}
          </p>
          {activePlatform ? (
            <a
              href={activePlatform.downloadSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF003C] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(255,0,60,0.42)] transition hover:bg-[#ff2a59]"
            >
              Download Parts List (PDF)
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PlatformPartsCatalog() {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  useEffect(() => {
    if (!activePlatform) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePlatform(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePlatform]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => setActivePlatform(platform)}
            className="group neon-panel overflow-hidden rounded-[8px] text-left transition hover:border-[#FF003C]/60 hover:shadow-[0_0_42px_rgba(255,0,60,0.18)] focus-visible:border-[#FF003C] focus-visible:outline-none"
          >
            <span className="relative block aspect-[4/3] bg-black">
              <Image
                src={platform.imageSrc}
                alt={platform.imageAlt}
                fill
                priority
                className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </span>
            <span className="block border-t border-white/10 bg-black/55 px-5 py-4">
              <span className="block text-lg font-black text-white">
                {platform.label}
              </span>
              <span className="mt-1 block text-sm font-semibold text-white/52">
                View LS swap parts list
              </span>
            </span>
          </button>
        ))}
      </div>

      {activePlatform ? (
        <PartsListModal
          activePlatform={activePlatform}
          onClose={() => setActivePlatform(null)}
        />
      ) : null}
    </>
  );
}

export function MySwapPartsListButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setActivePlatform(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setActivePlatform(null);
        }}
        className="rounded-full border border-[#FF003C]/45 bg-black/35 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-[#FF003C] hover:text-white sm:tracking-[0.16em]"
      >
        MySwap Parts List
      </button>
      {isOpen ? (
        <PartsListModal
          activePlatform={activePlatform}
          onClose={() => {
            setIsOpen(false);
            setActivePlatform(null);
          }}
          onSelectPlatform={setActivePlatform}
        />
      ) : null}
    </>
  );
}
