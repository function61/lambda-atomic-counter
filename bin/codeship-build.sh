#!/bin/bash -eu

cd src/
npm install
zip -r ../AtomicCounter.zip index.js node_modules
