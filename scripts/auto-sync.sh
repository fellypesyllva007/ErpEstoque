#!/bin/bash

cd "$(dirname "$0")/.."

git add .

git commit -m "Auto Sync $(date '+%Y-%m-%d %H:%M:%S')" || true

git push origin main
