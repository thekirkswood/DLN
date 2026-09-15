#!/usr/bin/env bash
# Thin wrap — the lab lives in /home/main/Repos/Builder.
exec /home/main/Repos/Builder/ops/push-builder-downstairs.sh "$@"
