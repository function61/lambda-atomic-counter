#!/bin/bash -eu

cd src/
npm install
zip -q -r ../AtomicCounter.zip index.js node_modules
