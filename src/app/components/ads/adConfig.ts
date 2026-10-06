// Paid pop-up ads, early-2000s style. A buyer picks a template and how flashy + annoying
// the ad is (1–5 each); those levels decide the tier and price. Tahreem reviews each order,
// emails a payment link if she approves it, and adds the ad to ADS by hand once it's paid.

export type AdTier = "annoying" | "very-annoying";
export type AdTemplate = "classic" | "winner" | "system";

export interface AdTierDef {
  price: number;
  name: string;
  maxLevel: number; // the highest flashiness/annoyance this tier allows
  preset: { flash: number; annoy: number };
  days: number;     // how long the ad runs on the site
}

export const AD_TIERS: Record<AdTier, AdTierDef> = {
  annoying: { price: 200, name: "annoying-ish", maxLevel: 3, preset: { flash: 2, annoy: 2 }, days: 7 },
  "very-annoying": { price: 500, name: "extremely annoying", maxLevel: 5, preset: { flash: 5, annoy: 5 }, days: 14 },
};

/** Anything above level 3 on either scale needs the $500 tier. */
export function tierFor(flash: number, annoy: number): AdTier {
  return Math.max(flash, annoy) <= AD_TIERS.annoying.maxLevel ? "annoying" : "very-annoying";
}

/** What each level adds, on top of the levels below it. */
export const FLASH_LEVELS = [
  "plain and polite",
  "blinking CLICK HERE! button",
  "headline flashes colours",
  "scrolling marquee headline",
  "rainbow flashing border",
];
export const ANNOY_LEVELS = [
  "pops up once, closes right away",
  "pops up sooner",
  "adds a \"you have 1 message\" pop-up",
  "shakes every few seconds",
  "comes back once after you close it",
];

export const AD_TEMPLATES: Record<AdTemplate, { name: string }> = {
  classic: { name: "classic deal" },
  winner: { name: "you won!" },
  system: { name: "system alert" },
};

export interface Ad {
  company: string;
  headline: string;
  body: string;
  cta: string;
  noLabel?: string; // optional second button that just closes the ad (the house ad's "no thanks")
  href: string;
  image?: string;
  template: AdTemplate;
  flash: number; // 1–5
  annoy: number; // 1–5
  startsOn: string; // YYYY-MM-DD; the ad runs for its tier's `days` from here
}

/** Approved, paid ads. Add one here to put it on the site. */
export const ADS: Ad[] = [];

export const AD_CONTACT_EMAIL = "gentlycarved@gmail.com";

/** Stripe Payment Links, emailed to the buyer once their ad is approved (not shown on the site). */
export const AD_PAYMENT_LINKS: Record<AdTier, string> = {
  annoying: "https://buy.stripe.com/eVqeVd2Ui2er21xatd2Ji00",
  "very-annoying": "https://buy.stripe.com/9B6cN57ay7yL0XtgRB2Ji01",
};

/** The paid ad running today, if any (the newest one wins). */
export function activeAd(now = new Date()): Ad | null {
  const running = ADS.filter((ad) => {
    const start = new Date(`${ad.startsOn}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + AD_TIERS[tierFor(ad.flash, ad.annoy)].days);
    return now >= start && now < end;
  });
  return running.sort((a, b) => b.startsOn.localeCompare(a.startsOn))[0] ?? null;
}
