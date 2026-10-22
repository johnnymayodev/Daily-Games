// Minimal DOM-ish fakes for the client scripts. They only implement the bits
// the scripts under test actually touch, so no full DOM implementation is
// needed.

export interface FakeClassList {
  readonly names: string[];
  add(name: string): void;
  remove(name: string): void;
  contains(name: string): boolean;
}

export interface FakeElement {
  dataset: Record<string, string | undefined>;
  classList: FakeClassList;
  attributes: Record<string, string>;
  complete: boolean;
  src: string;
  addEventListener(type: string, listener: () => void): void;
  removeAttribute(name: string): void;
  dispatchEvent(type: string): void;
}

export interface FakeGrid {
  children: FakeElement[];
  querySelectorAll(selector: string): FakeElement[];
  append(...elements: FakeElement[]): void;
}

export interface FakeDocument {
  documentElement: { dataset: Record<string, string> };
  querySelector(selector: string): FakeElement | null;
  querySelectorAll(selector: string): FakeElement[];
}

export function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

export function createFakeClassList(initial: string[] = []): FakeClassList {
  const names = new Set(initial);

  return {
    get names() {
      return [...names];
    },
    add(name: string) {
      names.add(name);
    },
    remove(name: string) {
      names.delete(name);
    },
    contains(name: string) {
      return names.has(name);
    },
  };
}

export function createFakeElement(
  options: {
    dataset?: Record<string, string | undefined>;
    classes?: string[];
    complete?: boolean;
    src?: string;
  } = {},
): FakeElement {
  const listeners = new Map<string, Set<() => void>>();

  return {
    dataset: { ...options.dataset },
    classList: createFakeClassList(options.classes),
    attributes: {},
    complete: options.complete ?? false,
    src: options.src ?? "",
    addEventListener(type: string, listener: () => void) {
      const bucket = listeners.get(type) ?? new Set<() => void>();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
    removeAttribute(name: string) {
      delete this.attributes[name];
    },
    dispatchEvent(type: string) {
      for (const listener of listeners.get(type) ?? []) {
        listener();
      }
    },
  };
}

// Cards are grid children; `append` moves existing children to the end, just
// like the DOM does, so sorting can be observed through `children`.
export function createFakeGrid(cards: FakeElement[] = []): FakeGrid {
  const children = [...cards];

  return {
    children,
    querySelectorAll() {
      return [...children];
    },
    append(...elements: FakeElement[]) {
      for (const element of elements) {
        const index = children.indexOf(element);

        if (index !== -1) {
          children.splice(index, 1);
        }

        children.push(element);
      }
    },
  };
}

export function createFakeDocument(options: { grid?: FakeGrid | null; images?: FakeElement[] } = {}): FakeDocument {
  const grid = options.grid ?? null;
  const images = options.images ?? [];

  return {
    documentElement: { dataset: {} },
    querySelector(selector: string) {
      return selector === ".game-grid" ? (grid as unknown as FakeElement) : null;
    },
    querySelectorAll(selector: string) {
      return selector === "img.game-card-image[data-src]" ? [...images] : [];
    },
  };
}

export function installFakeDocument(options: { grid?: FakeGrid | null; images?: FakeElement[] } = {}): FakeDocument {
  const document = createFakeDocument(options);

  defineGlobal("document", document);

  return document;
}

export function installFakeWindow(options: { standalone?: boolean; href?: string } = {}): {
  matchMedia: () => { matches: boolean };
  location: { href: string };
} {
  const window = {
    matchMedia: () => ({ matches: options.standalone ?? false }),
    location: { href: options.href ?? "" },
  };

  defineGlobal("window", window);

  return window;
}

export function installFakeNavigator(
  options: { userAgent?: string; platform?: string; maxTouchPoints?: number; standalone?: boolean } = {},
): { userAgent: string; platform: string; maxTouchPoints: number; standalone: boolean } {
  const navigator = {
    userAgent: options.userAgent ?? "",
    platform: options.platform ?? "",
    maxTouchPoints: options.maxTouchPoints ?? 0,
    standalone: options.standalone ?? false,
  };

  defineGlobal("navigator", navigator);

  return navigator;
}
