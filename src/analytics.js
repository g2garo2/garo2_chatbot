const GA_MEASUREMENT_ID = "G-8QE54PSHSF";
let analyticsRequested = false;

function ensureGtagStub() {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

export function initAnalytics() {
  if (typeof window === "undefined" || analyticsRequested) {
    return;
  }

  analyticsRequested = true;
  ensureGtagStub();

  const loadAnalytics = () => {
    if (document.querySelector(`script[data-ga-id="${GA_MEASUREMENT_ID}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.dataset.gaId = GA_MEASUREMENT_ID;
    script.onload = () => {
      window.gtag("js", new Date());
      window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
    };
    document.head.appendChild(script);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadAnalytics, { timeout: 2000 });
  } else {
    window.setTimeout(loadAnalytics, 1200);
  }
}

export function trackPageView(path) {
  if (typeof window === "undefined") {
    return;
  }

  ensureGtagStub();
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
}

export { GA_MEASUREMENT_ID };
