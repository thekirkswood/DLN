/** Thin RRP sheet for the ModYu press kit (hub must not import the shop). */
export const rrp = {
  balance: 42,
  cleanse: 32,
  hydrate: 60,
  bathe: 56,
  comfort: 68,
  protect: 42,
  nourish: 40,
} as const;

export const bundles = {
  fullSystem: 288,
  recoveryKit: 166,
  clinicPack: 184,
  continuousCare: rrp.protect + rrp.nourish,
} as const;

export const rrpPartsTotal =
  rrp.balance +
  rrp.cleanse +
  rrp.hydrate +
  rrp.bathe +
  rrp.comfort +
  rrp.protect +
  rrp.nourish;
