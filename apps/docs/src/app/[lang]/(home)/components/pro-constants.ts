import {env} from "~env";

export const SHOW_BANNER = env.NEXT_PUBLIC_SHOW_PRE_SALE_BANNER;

export const PRO_URL = env.NEXT_PUBLIC_PRO_URL ?? "https://blakeui.pro";

/**
 * Promo card dismissal persistence. `false` (current behaviour, per Greg):
 * the card returns on every visit and dismissal lasts only for the mounted
 * page. Flip to `true` to persist dismissal in localStorage without any
 * other change.
 */
export const PERSIST_CARD_DISMISSAL = false;

/**
 * Promo copy. Templates and AI tooling do not ship yet, so these strings
 * name what Pro actually sells today. They will change again when templates
 * and AI tooling land, which is why they live here and not in the
 * components.
 */
export const PRO_BANNER_TITLE = "BlakeUI Pro is live";
export const PRO_BANNER_DETAIL = "customizable data grids, charts & KPIs";
export const PRO_CARD_TITLE = "Build faster with BlakeUI Pro";
export const PRO_CARD_BODY =
  "Accessible data grids, charts, and dashboard components for React. Built for teams shipping enterprise UI.";
