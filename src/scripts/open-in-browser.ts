const OPEN_IN_BROWSER_KEY = "daily-games:open-in-browser";

export function isOpenInBrowserEnabled(): boolean {
  try {
    return localStorage.getItem(OPEN_IN_BROWSER_KEY) === "on";
  } catch {
    return false;
  }
}

export function storeOpenInBrowserEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(OPEN_IN_BROWSER_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable; the setting still applies for this page view.
  }
}

export function isInstalledApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// Installed iOS apps render every navigation in their own webview. Prefixing the
// URL with x-safari- hands it back to Safari instead. Returns true when the URL
// was handed off, false when the caller should open it normally.
export function openInSafari(url: string): boolean {
  if (!isOpenInBrowserEnabled() || !isInstalledApp() || !isIos()) {
    return false;
  }

  window.location.href = `x-safari-${url}`;
  return true;
}
