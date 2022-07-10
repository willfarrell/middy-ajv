#!/usr/bin/env bash

handlers=${1:-handlers}

# Compile JSON Schemas
# --code-esm Support https://github.com/ajv-validator/ajv-cli/pull/200
# --uri-resolver=fast-uri Support https://github.com/ajv-validator/ajv-cli/pull/210
function ajv {
  # `-c ajv-keywords/dist/keywords/typeof` require for `contextSchema`
  node ./node_modules/ajv-cli/dist/index.js compile --spec=draft2020 \
    -c ajv-formats -c ajv-formats-draft2019 -c ajv-keywords/dist/keywords/typeof \
    --strict=true --coerce-types=array --all-errors=true --use-defaults=empty --messages=false \
    -s ${1} -o ${1/json/js}
}

for file in ${handlers}/*/schema.*.json; do
  if [ ! -n "$(ajv $file | grep ' is valid')" ]; then
    exit 1
  fi
done
