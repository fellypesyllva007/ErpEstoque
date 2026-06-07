#!/bin/bash

cd /home/ubuntu/apps/ErpEstoque || exit 1

if [[ -n $(git status --porcelain) ]]; then
    git add .
    git commit -m "Auto Sync $(date '+%Y-%m-%d %H:%M:%S')" || true
    git push origin main
fi
