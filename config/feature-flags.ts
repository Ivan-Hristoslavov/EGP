/**
 * Site-wide feature toggles. Prefer flipping these over deleting code paths
 * when a capability may return later.
 */

/** When false: no day-off blackouts, banners, admin UI, or team leave blocking slots. */
export const isDayOffFeatureEnabled = false;
