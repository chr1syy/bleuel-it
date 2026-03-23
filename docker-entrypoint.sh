#!/bin/sh
if [ -n "$GITHUB_TOKEN" ]; then
  sed -i "s|{{GITHUB_TOKEN}}|${GITHUB_TOKEN}|g" /usr/share/nginx/html/script.js
fi
exec "$@"
