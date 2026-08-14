# Greenhouse

Registry prose. Machine source: `greenhouse/plots.json`. Keep them in sync.

## Public plots

### ModYu (`modyu`)

- Host: `modyu.designlabnorth.com`
- Kind: rebuild (they have a live site; we are building the next one)
- Status: growing
- Voice: Design Lab North have the pleasure of rebuilding ModYu — a calmer home for people before, during, and after hair transplant. Their current site is already out in the world; this plot is the facelift that should feel like them.
- Marks: `Site/public/plots/modyu.svg` (paper) + `modyu-white.svg` (ink)
- Source: GitHub `thekirkswood/modyu` · VPS `/srv/dln/plots/modyu` · Docker plot `plot-modyu`
- Access: DLN client user bound to `modyu`. Studio/owner always.

## Not listed yet

- Studio-owned site in development (wait).
- Studio-owned shell (wait until DLN is standing).
- Future outreach clients — add a plot file, do not preview-publish empty cards.

## Plot lifecycle

1. Create GitHub repo for the client site (Ewan).
2. Add `greenhouse/plots.json` entry + this file + Caddy host + compose service.
3. Build on PC (Cursor) → push → VPS pull into that plot’s container.
4. Client cookie on `.designlabnorth.com` opens the subdomain.
5. Public still sees the greenhouse story only.
6. After the first month: migrate container/image to the client’s server + DNS. Plot here can retire or stay as archive (decision later).
