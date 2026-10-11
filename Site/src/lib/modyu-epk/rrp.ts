/** Press RRP sheet mirrored from ModYu plot products.ts */
export const rrp = {
  balance: 42,
  cleanse: 32,
  hydrate: 60,
  bathe: 56,
  comfort: 68,
  protect: 42,
  nourish: 40,
} as const;

export const rrpPartsTotal =
  rrp.balance +
  rrp.cleanse +
  rrp.hydrate +
  rrp.bathe +
  rrp.comfort +
  rrp.protect +
  rrp.nourish;

export const bundles = {
  fullSystem: 288, // deal vs parts £340
  recoveryKit: 166, // Hydrate + Bathe + Comfort (parts £184)
  clinicPack: 184, // Cleanse + Hydrate + Bathe + Comfort (B2B; parts £216)
  continuousCare: rrp.protect + rrp.nourish, // £82
} as const;
