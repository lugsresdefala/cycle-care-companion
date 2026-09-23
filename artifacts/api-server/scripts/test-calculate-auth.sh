#!/usr/bin/env bash
set -euo pipefail

# Never connect to the workspace/production database. Each invocation owns a
# fresh cluster, reachable only through a private temporary Unix socket.
for tool in initdb pg_ctl; do
  command -v "$tool" >/dev/null || { echo "Required test dependency: PostgreSQL ($tool)" >&2; exit 1; }
done
TEMP_ROOT="$(mktemp -d /tmp/idalia-auth-test.XXXXXX)"
cleanup() {
  pg_ctl -D "$TEMP_ROOT/data" -m immediate -w stop >/dev/null 2>&1 || true
  rm -rf "$TEMP_ROOT"
}
trap cleanup EXIT
mkdir "$TEMP_ROOT/socket"
initdb -D "$TEMP_ROOT/data" -U isolated_test --auth=trust --no-locale >/dev/null
pg_ctl -D "$TEMP_ROOT/data" -l "$TEMP_ROOT/postgres.log" \
  -o "-F -k $TEMP_ROOT/socket -c listen_addresses=''" -w start >/dev/null
export DATABASE_URL="postgresql://isolated_test@localhost/postgres?host=$TEMP_ROOT/socket"
export CALCULATE_AUTH_ISOLATED_DB="$TEMP_ROOT/socket"
# The schema and queries are the application ones, not a SQL mock.
pnpm --dir ../../lib/db exec drizzle-kit push --force >/dev/null
pnpm exec vitest run --config vitest.auth.config.ts