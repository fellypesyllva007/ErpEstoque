#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# O KoreERP atual mantém uma única arquitetura de backend: Node/Express +
# controllers/services + Prisma/PostgreSQL. Para evitar a coexistência com a
# pilha .NET descartada (Minimal API/Npgsql ou Controllers/EF Core), este check
# falha se artefatos C#/.NET forem reintroduzidos no repositório.
mapfile -t dotnet_files < <(
  find "$ROOT_DIR" \
    \( -path "$ROOT_DIR/.git" -o -path "$ROOT_DIR/backend/node_modules" -o -path "$ROOT_DIR/backend/dist" -o -path "$ROOT_DIR/backend/.prisma" \) -prune \
    -o -type f \( \
      -name '*.cs' \
      -o -name '*.csproj' \
      -o -name '*.sln' \
      -o -name 'appsettings*.json' \
      -o -name 'launchSettings.json' \
      -o -name 'Directory.Build.props' \
      -o -name 'Directory.Build.targets' \
      -o -name 'NuGet.config' \
      -o -name 'packages.config' \
    \) -print
)

if (( ${#dotnet_files[@]} > 0 )); then
  printf 'Arquitetura .NET descartada encontrada; remova estes artefatos:\n' >&2
  printf ' - %s\n' "${dotnet_files[@]#$ROOT_DIR/}" >&2
  exit 1
fi

printf 'OK: apenas a arquitetura Node/Express + Prisma/PostgreSQL está presente.\n'
