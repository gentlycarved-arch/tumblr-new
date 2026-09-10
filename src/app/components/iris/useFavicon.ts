import { useEffect } from "react";

/** Swaps the browser tab's favicon to `href` while the calling component is
 * mounted, restoring whatever it was before on unmount. */
export function useFavicon(href: string) {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const previousHref = link?.getAttribute("href") ?? null;
    const created = !link;

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {
      if (!link) return;
      if (created) {
        link.remove();
      } else if (previousHref !== null) {
        link.href = previousHref;
      }
    };
  }, [href]);
}
