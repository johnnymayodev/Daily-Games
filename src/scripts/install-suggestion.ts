import { isInstalledApp } from "./open-in-browser";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let installPrompt: InstallPromptEvent | null = null;

// Chromium fires this when the app is installable; stash it so the settings button can trigger it.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event as InstallPromptEvent;
});

// The installed app already runs full screen, so only nudge mobile browsers.
export function shouldSuggestInstall(): boolean {
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac; touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isMobile && !isInstalledApp();
}

export function canPromptInstall(): boolean {
  return installPrompt !== null;
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const deferred = installPrompt;

  if (!deferred) {
    return "unavailable";
  }

  installPrompt = null;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;

  return outcome;
}
