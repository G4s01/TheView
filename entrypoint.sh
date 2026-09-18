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

# Fix Docker socket permissions dynamically if mounted
if [ -S /var/run/docker.sock ]; then
    DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
    # se il GID del socket è diverso dal PGID, aggiungiamo il gruppo
    if [ "$DOCKER_GID" != "$PGID" ]; then
        if ! getent group "$DOCKER_GID" > /dev/null 2>&1; then
            groupadd -g "$DOCKER_GID" docker_sock
        fi
        usermod -aG "$DOCKER_GID" node
        echo "Added node user to group $DOCKER_GID to access docker.sock"
    fi
fi

# Set umask
umask "$UMASK"

# Execute the main command dropping privileges
exec gosu node "$@"

