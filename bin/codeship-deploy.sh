#!/bin/sh -eu

echo "# Deploy .zip to Lambda"
aws lambda update-function-code --function-name AtomicCounter --zip-file fileb://AtomicCounter.zip
