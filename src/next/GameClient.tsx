"use client";

import { useEffect, useState } from "react";
import type App from "@/core/App";
import type { UIController } from "@/features/menu";
import { telemetry } from "@/systems/TelemetryManager";
import { type SessionPayload } from "@/systems/SessionExporter";
import { GAME_DURATION_SECONDS } from "@/config/gameConfig";

export default function GameClient() {
  const [stats, setStats] = useState({ score: 0, accuracy: 0, streak: 0, hits: 0, misses: 0, peakStreak: 0, avgTimePerTarget: 0 });
  const [time, setTime] = useState(GAME_DURATION_SECONDS);
  const [sessionResults, setSessionResults] = useState<SessionPayload | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false); // true once first shot fired

  useEffect(() => {
    let disposed = false;
    let appInstance: App | undefined;
    let uiController: UIController | undefined;

    const start = async () => {
      const { default: logCredits } = await import("@/credits");

      if (disposed) return;

      logCredits();

      const [{ default: AppClass }, { mountUI }, { ensureCsrfCookie }] = await Promise.all([
        import("@/core/App"),
        import("@/features/menu"),
        import("@/ui/react/api/http"),
      ]);

      if (disposed) return;

      try {
        await ensureCsrfCookie();
      } catch (error) {
        console.warn("Failed to ensure CSRF cookie", error);
      }

      if (disposed) return;

      appInstance = new AppClass(undefined, { disableServer: true, editorMode: false });
      uiController = mountUI({
        onStart: (scenarioId: string) => {
          appInstance?.startGame(scenarioId);
          setGameStarted(true);
          setGameEnded(false);
          setTimerStarted(false); // reset: wait for first shot
          setSessionResults(null);
        },
        onPauseChange: (paused: boolean) => appInstance?.setPaused(paused),
        onExit: () => appInstance?.stopMusic(),
      });

      appInstance.attachUI(uiController);
      
      // Expose globally for handleMainMenu
      (window as any).__uiController = uiController;
      // We store the app instance on window for the timer loop to access it
      (window as any).__appInstance = appInstance;
    };

    void start();

    return () => {
      disposed = true;
      if (appInstance) {
        appInstance.setPaused(true);
      }
    };
  }, []);

  useEffect(() => {
    const handleSessionComplete = (e: Event) => {
      const customEvent = e as CustomEvent<SessionPayload>;
      setSessionResults(customEvent.detail);
      setGameEnded(true);
    };

    window.addEventListener("aimtrainer:sessionComplete", handleSessionComplete);

    const interval = setInterval(() => {
      if (!gameStarted || gameEnded) return;
      
      const app = (window as any).__appInstance;
      if (!app) return;

      if (app.gameStartTime !== null) {
        // Timer is running — update HUD
        if (!timerStarted) setTimerStarted(true);
        setStats(telemetry.snapshot());
        setTime(Math.ceil(app.timeRemaining));
      } else {
        // Waiting for first shot — keep time at full duration
        setTime(GAME_DURATION_SECONDS);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener("aimtrainer:sessionComplete", handleSessionComplete);
    };
  }, [gameStarted, gameEnded, timerStarted]);


  const handleMainMenu = () => {
    const app = (window as any).__appInstance;
    if (app) {
      setGameEnded(false);
      setGameStarted(false);
      setSessionResults(null);
      telemetry.reset();
      
      // Tell UIRoot to go back to the menu
      const uiCtrl = (window as any).__uiController;
      if (uiCtrl?.showMenu) {
        uiCtrl.showMenu();
      }
      
      // Exit pointer lock if active
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-zinc-950 font-mono text-white">
      <canvas id="canvas" className="absolute inset-0 h-full w-full" />
      <div id="ui-root" className="relative z-10 h-full w-full" />
      
      {/* HUD overlay */}
      {gameStarted && !gameEnded && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none z-20">
          <div className="flex flex-col gap-1 bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-yellow-500/30">
            <div className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Score</div>
            <div className="text-3xl font-black text-yellow-300">{stats.score.toLocaleString()}</div>
          </div>
          
          <div className="flex flex-col gap-1 items-center bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="text-slate-300 text-xs font-bold tracking-widest uppercase">Time</div>
            {timerStarted ? (
              <div className={`text-4xl font-black tabular-nums ${time <= 10 ? 'text-red-400 animate-pulse' : time <= 20 ? 'text-amber-400' : 'text-white'}`}>
                {time}
              </div>
            ) : (
              <div className="text-2xl font-black text-emerald-400 animate-pulse tracking-widest">
                FIRE!
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-cyan-500/30">
            <div className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Streak / Accuracy</div>
            <div className="flex items-baseline gap-4">
              <div className={`text-3xl font-black ${
                stats.streak >= 10 ? 'text-red-400 animate-pulse' 
                : stats.streak >= 5 ? 'text-orange-400' 
                : 'text-white'
              }`}>
                {stats.streak}x
              </div>
              <div className="text-xl font-bold text-cyan-300">{stats.accuracy}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Results overlay */}
      {gameEnded && sessionResults && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center pointer-events-auto">
            <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">SESSION COMPLETE</h1>
            
            <div className="w-full space-y-4 mb-8">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                <span className="text-zinc-400 font-bold tracking-wider text-sm">FINAL SCORE</span>
                <span className="text-2xl font-black">{sessionResults.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                <span className="text-zinc-400 font-bold tracking-wider text-sm">ACCURACY</span>
                <span className="text-xl font-bold">{sessionResults.accuracy}%</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                <span className="text-zinc-400 font-bold tracking-wider text-sm">HITS / MISSES</span>
                <span className="text-xl font-bold text-zinc-300">
                  <span className="text-emerald-400">{sessionResults.hits}</span> / <span className="text-red-400">{sessionResults.misses}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                <span className="text-zinc-400 font-bold tracking-wider text-sm">PEAK STREAK</span>
                <span className="text-xl font-bold text-amber-400">{sessionResults.peakStreak}x</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                <span className="text-zinc-400 font-bold tracking-wider text-sm">AVG TIME / TARGET</span>
                <span className="text-xl font-bold text-blue-400">{Math.round(sessionResults.avgTimePerTarget)}ms</span>
              </div>
            </div>
            
            <div className="w-full">
              <button 
                onClick={handleMainMenu}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-xl transition-all active:scale-95 tracking-widest text-lg"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
