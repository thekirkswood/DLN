export type Plot = {
  slug: string;
  name: string;
  status: "growing" | "rebuilding" | "resting" | "migrated";
  kind: "rebuild" | "new" | "brand";
  /** Who the plot belongs to. Studio plots may be listed without a host. */
  party: "client" | "studio";
  hosts: string[];
  /** Full URL for “Enter the plot”. Prefer this over hosts[0] while DNS catches up. */
  enterUrl?: string;
  localPreview: string;
  public: boolean;
  voice: string;
  logoPaper?: string;
  logoInk?: string;
  /** Extra status beside growing, e.g. “beta test”. Choozlist only for now. */
  badge?: string;
  /** Shown on the plot story, not the homepage. */
  betaContact?: string;
  /** Offline lab only. House on this PC. */
  lab?: {
    housePath: string;
    localPort?: number;
    github?: string;
    inboxRel?: string;
  };
};
