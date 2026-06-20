import { ROUTES } from './constants.js';

let currentRoute = null;
let currentParams = {};
let currentCleanup = null;

const routes = new Map();

export function registerRoute(pattern, handler) {
  routes.set(pattern, handler);
}

function matchRoute(path) {
  for (const [pattern, handler] of routes) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexStr}$`);
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });
      return { handler, params };
    }
  }
  return null;
}

export async function navigateTo(path) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const match = matchRoute(path);
  if (!match) {
    window.history.pushState({}, '', ROUTES.HOME);
    return navigateTo(ROUTES.HOME);
  }

  window.history.pushState({}, '', path);
  currentRoute = path;
  currentParams = match.params;

  const mainContainer = document.getElementById('main-container');
  currentCleanup = await match.handler(mainContainer, match.params);
}

window.addEventListener('popstate', () => {
  navigateTo(window.location.pathname);
});

export function getCurrentParams() {
  return currentParams;
}

export function getCurrentRoute() {
  return currentRoute;
}
