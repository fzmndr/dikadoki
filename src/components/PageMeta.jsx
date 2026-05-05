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

    const siteUrl = "https://dikadoki.vercel.app";
    const pageUrl = window.location.href;

    const pageImage = image
      ? `${siteUrl}${image}`
      : `${siteUrl}/og-image.jpg`;

    document.title = pageTitle;

    const setMeta = (selector, type, value) => {
      let tag = document.querySelector(selector);

      if (!tag) {
        tag = document.createElement("meta");

        if (type === "property") {
          tag.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1]);
        } else {
          tag.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1]);
        }

        document.head.appendChild(tag);
      }

      tag.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', "name", pageDescription);

    setMeta('meta[property="og:type"]', "property", "website");
    setMeta('meta[property="og:title"]', "property", pageTitle);
    setMeta('meta[property="og:description"]', "property", pageDescription);
    setMeta('meta[property="og:url"]', "property", pageUrl);
    setMeta('meta[property="og:image"]', "property", pageImage);

    setMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", pageTitle);
    setMeta('meta[name="twitter:description"]', "name", pageDescription);
    setMeta('meta[name="twitter:image"]', "name", pageImage);
  }, [title, description, image]);

  return null;
}