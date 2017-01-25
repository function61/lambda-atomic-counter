#!/bin/sh -eu

aws lambda update-function-code --function-name AtomicCounter --zip-file fileb://AtomicCounter.zip
