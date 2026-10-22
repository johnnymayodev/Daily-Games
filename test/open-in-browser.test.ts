import { describe, expect, it } from "vitest";
import { openInSafari } from "../src/scripts/open-in-browser";
import { installFakeNavigator, installFakeWindow } from "./helpers";

const OPEN_IN_BROWSER_KEY = "daily-games:open-in-browser";

const IPHONE_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";
const DESKTOP_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";

function enableOpenInBrowser(): void {
  localStorage.setItem(OPEN_IN_BROWSER_KEY, "on");
}

describe("openInSafari", () => {
  it("returns false when the setting is off", () => {
    installFakeWindow({ standalone: true });
    installFakeNavigator({ userAgent: IPHONE_USER_AGENT });

    expect(openInSafari("https://example.com")).toBe(false);
  });

  it("returns false when the app is not installed", () => {
    enableOpenInBrowser();
    installFakeWindow({ standalone: false });
    installFakeNavigator({ userAgent: IPHONE_USER_AGENT });

    expect(openInSafari("https://example.com")).toBe(false);
  });

  it("returns false when the platform is not iOS", () => {
    enableOpenInBrowser();
    installFakeWindow({ standalone: true });
    installFakeNavigator({ userAgent: DESKTOP_USER_AGENT, platform: "MacIntel", maxTouchPoints: 0 });

    expect(openInSafari("https://example.com")).toBe(false);
  });

  it("hands the URL to Safari on an installed iOS app", () => {
    enableOpenInBrowser();
    const window = installFakeWindow({ standalone: true });
    installFakeNavigator({ userAgent: IPHONE_USER_AGENT });

    expect(openInSafari("https://example.com/game")).toBe(true);
    expect(window.location.href).toBe("x-safari-https://example.com/game");
  });
});
