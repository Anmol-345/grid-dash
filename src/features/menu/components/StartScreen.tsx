import Image from "next/image";
import React from "react";
import Button from "@/features/shared/ui/components/Button";
import type { ScenarioConfig } from "@/config/scenarios";
import { FaTwitter, FaTelegram, FaYoutube, FaGithub } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import socials from "@/config/socials.json";

type Props = {
  scenarios: ScenarioConfig[];
  onStart: (scenarioId: string) => void;
  onSettings: () => void;
};

export default function StartScreen({ scenarios, onStart, onSettings }: Props) {
  const ICONS = {
    twitter: FaTwitter,
    telegram: FaTelegram,
    youtube: FaYoutube,
    github: FaGithub,
    instagram: RiInstagramFill,
  } as const;

  type SocialIconKey = keyof typeof ICONS;
  type SocialLink = {
    id: string;
    label: string;
    url: string;
    icon: SocialIconKey;
  };

  const socialLinks: SocialLink[] = Array.isArray((socials as { links?: unknown }).links)
    ? (((socials as { links: unknown }).links) as SocialLink[])
    : [];

  const requestPointerLockOnCanvas = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
    try {
      const ret = canvas?.requestPointerLock?.();
      if (ret && typeof ret.catch === "function") {
        ret.catch(() => {
          /* swallow SecurityError; user can click canvas to retry */
        });
      }
    } catch (_) {
      /* swallow; user can click inside the canvas later */
    }
  };

  const onStartClick = (scenarioId: string) => {
    // Arranca juego primero (oculta overlay) y luego pide pointer lock
    onStart(scenarioId);
    try {
      requestPointerLockOnCanvas();
    } catch (_) {
      /* noop */
    }
  };

  const onExitClick = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    const fallback = process.env.NEXT_PUBLIC_EXIT_URL ?? "about:blank";
    try {
      window.location.assign(fallback);
    } catch (error) {
      console.warn("Failed to navigate away via EXIT button", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[radial-gradient(#fff,#fff)] flex flex-col items-center justify-center gap-6 text-black z-10">
      {/* background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,#000_49%,#000_51%,transparent_51%),linear-gradient(0deg,transparent_49%,#000_49%,#000_51%,transparent_51%)] [background-size:80px_80px] opacity-10 z-[1]" />

      {/* Decorative cubes */}
      <div
        className="absolute w-10 h-10 border-2 border-black bg-transparent z-[2] animate-float will-change-transform"
        style={{ top: "10%", left: "15%", transform: "translate3d(0, 0, 0) rotate(15deg)" }}
      />
      <div
        className="absolute w-10 h-10 border-2 border-black bg-[#ff0000] z-[2] animate-float will-change-transform"
        style={{ top: "20%", right: "20%", transform: "translate3d(0, 0, 0) rotate(-10deg)" }}
      />
      <div
        className="absolute w-10 h-10 border-2 border-black bg-transparent z-[2] animate-float will-change-transform"
        style={{ bottom: "30%", left: "10%", transform: "translate3d(0, 0, 0) rotate(25deg)" }}
      />
      <div
        className="absolute w-10 h-10 border-2 border-black bg-transparent z-[2] animate-float will-change-transform"
        style={{ bottom: "15%", right: "15%", transform: "translate3d(0, 0, 0) rotate(-20deg)" }}
      />
      <div
        className="absolute w-10 h-10 border-2 border-black bg-transparent z-[2] animate-float will-change-transform"
        style={{ top: "60%", left: "5%", transform: "translate3d(0, 0, 0) rotate(45deg)" }}
      />
      {/* Social Links - top right (from config) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {socialLinks.map((link) => {
          const Icon = ICONS[link.icon] ?? FaGithub;
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-1 transition-transform duration-150 hover:scale-110"
              aria-label={link.label}
              title={link.label}
            >
              <Icon className="text-2xl text-black/80 group-hover:text-black transition-colors" />
            </a>
          );
        })}
      </div>

      {/* Menu container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <Image
          src="/logo.png"
          alt="Logo"
          width={498}
          height={410}
          priority
          className="h-[200px] w-auto mx-auto translate-x-[20px]"
          sizes="(max-width: 768px) 60vw, 498px"
        />
        <Image
          src="/redblock-online.png"
          alt="Redblock Online"
          width={1719}
          height={172}
          className="h-20 w-auto mt-10 mb-10"
          sizes="(max-width: 768px) 70vw, 600px"
        />
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Button
              className="startButton"
              id="startButton-quick-warmup"
              size="lg"
              variant="primary"
              onClick={() => onStartClick(scenarios[0].id)}
            >
              Play Gridshot
            </Button>
          </div>
          <Button size="lg" variant="outline" onClick={onSettings}>
            SETTINGS
          </Button>
          <Button size="lg" variant="outline" onClick={onExitClick}>
            EXIT
          </Button>
        </div>
      </div>

      <div className="absolute right-12 bottom-12 text-zinc-500 font-mono text-sm tracking-widest pointer-events-none select-none">
        GRINDSHOT V1.0.0
      </div>
    </div>
  );
}
