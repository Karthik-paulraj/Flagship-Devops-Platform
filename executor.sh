#!/bin/bash

DB_HOST="${DB_HOST:-mongo}"
DB_PORT="${DB_PORT:-27017}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
MAX_TRIES=30

wait_for_port() {
  local host=$1 port=$2 name=$3 tries=0
  echo "Waiting for $name at $host:$port ..."
  until (echo > /dev/tcp/"$host"/"$port") 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge "$MAX_TRIES" ]; then
      echo "$name not reachable after $MAX_TRIES attempts. Exiting."
      exit 1
    fi
    echo "$name not ready ($tries/$MAX_TRIES), retrying in 2s..."
    sleep 2
  done
  echo "$name is up."
}

# 1. wait for the database
wait_for_port "$DB_HOST" "$DB_PORT" "Database"

# 2. start the backend in the background
echo "Starting Backend Server"
node /home/app/backend/src/server.js &

# 3. wait for the backend to accept connections
wait_for_port localhost "$BACKEND_PORT" "Backend"

# 4. start the frontend in the foreground (keeps the container alive)
echo "Starting frontend UI"
cd /home/app/frontend
exec npm run dev -- --host