#!/bin/bash
CONTAINER="hermes-agent-ngef-hermes-agent-1"

check_and_restart() {
  local profile=$1
  local port=$2
  local code=$(docker exec "$CONTAINER" curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${port}/health" 2>/dev/null)
  if [ "$code" != "200" ]; then
    echo "$(date): $profile (port $port) unhealthy (got $code) — restarting"
    docker exec -d "$CONTAINER" hermes -p "$profile" gateway run --replace
  fi
}

check_and_restart default 8642
check_and_restart finance 8647
check_and_restart funding 8643
check_and_restart marketing 8645
check_and_restart product 8646
