const GA_MEASUREMENT_ID = "G-8QE54PSHSF";

export function trackPageView(path) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
}

export { GA_MEASUREMENT_ID };
