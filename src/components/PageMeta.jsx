import { useEffect } from "react";
import { siteConfig } from "../config/site";

export default function PageMeta({ title, description, image }) {
  useEffect(() => {
    const pageTitle = title
      ? `${title} — ${siteConfig.brandName}`
      : siteConfig.brandName;

    const pageDescription =
      description ||
      "dikadoki menyediakan produk digital, jasa kreatif, dan layanan visual.";

    const pageImage = image || "/og-image.jpg";
    const pageUrl = window.location.href;

    document.title = pageTitle;

    const setMeta = (selector, attribute, value) => {
      let tag = document.querySelector(selector);

      if (!tag) {
        tag = document.createElement("meta");

        if (selector.includes("property=")) {
          tag.setAttribute(
            "property",
            selector.match(/property="([^"]+)"/)?.[1] || ""
          );
        } else {
          tag.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
        }

        document.head.appendChild(tag);
      }

      tag.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', "content", pageDescription);

    setMeta('meta[property="og:title"]', "content", pageTitle);
    setMeta('meta[property="og:description"]', "content", pageDescription);
    setMeta('meta[property="og:image"]', "content", pageImage);
    setMeta('meta[property="og:url"]', "content", pageUrl);
    setMeta('meta[property="og:type"]', "content", "website");

    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", pageTitle);
    setMeta('meta[name="twitter:description"]', "content", pageDescription);
    setMeta('meta[name="twitter:image"]', "content", pageImage);
  }, [title, description, image]);

  return null;
}