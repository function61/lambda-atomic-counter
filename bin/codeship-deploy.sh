#!/bin/sh -eu

echo "# Deploy .zip to Lambda"
aws lambda update-function-code --function-name AtomicCounter --zip-file fileb://AtomicCounter.zip

echo "# Publishing to https://s3.amazonaws.com/files.function61.com/lambda-atomic-counter/master.zip"
aws s3 cp AtomicCounter.zip s3://files.function61.com/lambda-atomic-counter/master.zip
