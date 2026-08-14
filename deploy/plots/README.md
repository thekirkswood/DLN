# Add a plot
# 1. greenhouse/plots.json + memory/greenhouse.md
# 2. Copy deploy/plots/placeholder → deploy/plots/<slug> (or the real app Dockerfile)
# 3. Add a compose service plot-<slug>
# 4. Add a Caddy host <slug>.designlabnorth.com with forward_auth ?plot=<slug>
# 5. Changelog k:bp if this is the first of a new kind; else k:add
