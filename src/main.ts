import type { UIController } from "@/features/menu";
import type AppClass from "./core/App";

export let app: AppClass | undefined;
export let ui: UIController | undefined;

(async () => {
  const { default: logCredits } = await import("./credits");
  logCredits();

  const [{ default: App }, { mountUI }, { ensureCsrfCookie }] = await Promise.all([
    import("./core/App"),
    import("@/features/menu"),
    import("@/ui/react/api/http"),
  ]);

  try {
    await ensureCsrfCookie();
  } catch {}

  app = new App();
  ui = mountUI({
    onStart: (scenarioId: string) => app!.startGame(scenarioId),
    onPauseChange: (paused: boolean) => app!.setPaused(paused),
    onExit: () => app!.stopMusic(),
  });

  app.attachUI(ui);
})();
