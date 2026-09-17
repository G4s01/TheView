#!/bin/bash

PUID=${PUID:-1000}
PGID=${PGID:-1000}
UMASK=${UMASK:-022}

echo "Starting with UID: $PUID, GID: $PGID, UMASK: $UMASK"

# Map the default 'node' user to the requested PUID and PGID
groupmod -o -g "$PGID" node
usermod -o -u "$PUID" node

# Ensure the data directory exists and set correct permissions
mkdir -p /app/data
chown -R node:node /app/data

# Set umask
umask "$UMASK"

# Execute the main command dropping privileges
exec gosu node "$@"

