#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR" || exit 1

npm run demo
STATUS=$?

if [ "$STATUS" -ne 0 ] && [ "$STATUS" -ne 130 ]; then
  echo
  read -r -p "Запуск не удался. Нажмите Enter, чтобы закрыть окно…"
fi

exit "$STATUS"
