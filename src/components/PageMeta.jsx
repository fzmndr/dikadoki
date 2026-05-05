import { useEffect } from "react";
import { siteConfig } from "../config/site";

export default function PageMeta({ title, description }) {
  useEffect(() => {
    const pageTitle = title
      ? `${title} — ${siteConfig.brandName}`
      : siteConfig.brandName;

    document.title = pageTitle;

    const metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
}