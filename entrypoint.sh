#!/bin/sh
set -e
find /app/.next -type f -name "*.js" -exec sed -i "s|__NEXT_PUBLIC_API_URL__|${NEXT_PUBLIC_API_URL}|g" {} \;
exec node server.js
