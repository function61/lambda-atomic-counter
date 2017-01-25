#!/bin/bash -eu

cd src/

echo "# Installing npm modules"
npm install

echo "# Making the .zip bundle"
zip -q -r ../AtomicCounter.zip index.js node_modules
