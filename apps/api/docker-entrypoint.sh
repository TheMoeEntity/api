#!/bin/sh
set -e

echo "▸ Applying database migrations"
prisma migrate deploy

echo "▸ Seeding (skipped automatically if data exists)"
prisma db seed

echo "▸ Starting API"
# `exec` replaces this shell with Node, so Node becomes PID 1 and receives
# SIGTERM directly from `docker compose down`. Without it, the shell eats
# the signal and graceful shutdown never runs.
exec node dist/index.js
