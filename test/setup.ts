import { afterEach, beforeEach, vi } from "vitest";
import { defineGlobal, installFakeDocument, installFakeNavigator, installFakeWindow } from "./helpers";

// Map-backed stand-in for the browser's Storage API.
class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, String(value));
  }
}

// Every test starts from the same empty storage and the same empty page, so
// the suite stays deterministic and order-independent.
beforeEach(() => {
  defineGlobal("localStorage", new MemoryStorage());
  installFakeDocument();
  installFakeWindow();
  installFakeNavigator();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
