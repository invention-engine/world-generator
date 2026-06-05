import { JSDOM } from "jsdom";

/**
 * Initializes a headless DOM environment using JSDOM.
 * This mocks the necessary browser globals required by FMG's modules.
 */
export function setupHeadless() {
  const dom = new JSDOM("<!DOCTYPE html><html><body><div id='map'></div></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true
  });

  const { window } = dom;
  const { document } = window;

  // Mock getElementById to return a dummy element if not found
  const originalGetElementById = document.getElementById.bind(document);
  document.getElementById = (id: string) => {
    let el = originalGetElementById(id);
    if (!el) {
      // Create a dummy element to avoid null pointer errors in modules
      el = document.createElement("div");
      el.id = id;
      // For some specific elements like selects, we might need more
      if (id.includes("Select") || id.includes("List") || id.includes("Set")) {
        (el as any).append = () => {};
        (el as any).options = [];
        (el as any).selectedOptions = [];
      }
      // Add it to body so it can be found again if needed
      document.body.appendChild(el);
      // Elements with ID are also available as global variables in browsers
      (window as any)[id] = el;
      if (!(id in global)) (global as any)[id] = el;
    }
    return el;
  };

  // Mock FontFace and document.fonts
  const FontFaceMock = class {
    constructor() {}
    load() {
      return Promise.resolve(this);
    }
  };
  (window as any).FontFace = FontFaceMock;
  (global as any).FontFace = FontFaceMock;

  (document as any).fonts = {
    add: () => {},
    clear: () => {},
    delete: () => {}
  };

  // Create a proxy for window that syncs with global
  const windowProxy = new Proxy(window, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      (target as any)[prop] = value;
      if (typeof prop === "string" && !(prop in global)) {
        (global as any)[prop] = value;
      }
      return true;
    }
  });

  // Mock basic browser globals
  global.window = windowProxy as any;
  global.document = window.document;
  global.Node = window.Node;
  global.Element = window.Element;
  global.HTMLElement = window.HTMLElement;
  global.SVGElement = window.SVGElement;
  global.Image = window.Image;
  global.HTMLCanvasElement = window.HTMLCanvasElement;

  Object.defineProperty(global, "navigator", {
    value: window.navigator,
    writable: true,
    configurable: true
  });

  Object.defineProperty(global, "location", {
    value: window.location,
    writable: true,
    configurable: true
  });
  global.requestAnimationFrame = callback => setTimeout(callback, 0) as any;
  global.cancelAnimationFrame = id => clearTimeout(id);

  // Mock performance
  global.performance = window.performance;

  // Mock D3 requirements if any
  (global as any).XMLSerializer = (window as any).XMLSerializer;

  // Initialize core world state globals
  (global as any).seed = "";
  (global as any).grid = {};
  (global as any).pack = {};
  (global as any).graphWidth = 1000;
  (global as any).graphHeight = 1000;
  (global as any).INFO = true;
  (global as any).TIME = true;
  (global as any).WARN = true;
  (global as any).ERROR = true;

  return dom;
}
