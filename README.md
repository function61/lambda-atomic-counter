What?
-----

This is a Lambda function that, when installed, offers you a HTTP service
with which you can increment DynamoDB-backed counters. Use case is to generate sequential unique IDs (1, 2, 3, ...).
There are still times when you just can't use a UUID, and you need this service to be reliable and available - hence ran on AWS.


Why?
----

Our use case was to implement globally unique tenant IDs for a multi-tenanted application that for space saving
purpose shall remain a (relatively small) integer instead of a UUID. Most of our architecture is eventually consistent,
so we cannot generate atomic sequential IDs for the few entities that need them and that's what this service is for.


How?
----

```
$ curl -X POST https://REDACTED.execute-api.us-east-1.amazonaws.com/prod/counter/increment?counter=mycounter
{
	"counter": "mycounter",
	"new_value": 714
}
```

The `REDACTED` part you'll find out after you install this package to your AWS account.


Download
--------

Master release is always available from S3 as 
[master.zip](https://s3.amazonaws.com/files.function61.com/lambda-atomic-counter/master.zip),
published automatically from the CI server.


Credits
-------

- This project is built on the work of [serg-io/dynamodb-atomic-counter](https://github.com/serg-io/dynamodb-atomic-counter), thanks!


Install
-------

**Step 1**: Create DynamoDB table:

- Go to `AWS > DynamoDB > Tables > Create`
- Table name = `AtomicCounters`
- Primary key = `id` (type `string`)
- `[ Create ]`

**Step 2**: Create IAM role:

- Go to `AWS > IAM > Roles > Create new role`
- Role name = `AtomicCounter`
- Role type = `AWS Service Roles > AWS Lambda`
- Do not attach any policies, but click `[ Next ]` and `[ Create role ]`

Now, `AWS > IAM > Roles > AtomicCounter > Inline policies > Custom policy`:

- Name = `dynamodb-atomiccounters`

Content:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Action": [
                "dynamodb:UpdateItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/AtomicCounters"
            ]
        },
        {
            "Sid": "",
            "Resource": "*",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Effect": "Allow"
        }
    ]
}
```

**Step 3**: Create Lambda function:

- Go to `AWS > Lambda > Create`
- Use blank function as a template - we'll overwrite it soon
- Do not add any triggers - just hit `[ Next ]`
- Name = `AtomicCounter`
- Runtime = `Node.js 4.3`
- Code entry type = `Upload a .ZIP file`
- Download [this zip file](https://s3.amazonaws.com/files.function61.com/lambda-atomic-counter/master.zip) to your desktop, and then upload to Lambda
- Role = `Choose an existing role`
- Existing role = `AtomicCounter`
- Timeout = `15 sec`
- `[ Create function ]`


**Step 4**: Create API Gateway:

- Go to `AWS > API Gateway > Create API > New API`
- Name = `AtomicCounter`
- `[ Create API ]`

Now in `Actions > Create resource`:

- Configure as proxy resource = `check`
- Resource name = `proxy`
- Resource path = `{proxy+}`
- `[ Create resource ]`
- Integration type = `Lambda function proxy`
- Lambda region = `the region of your Lambda function`
- Lambda function = `AtomicCounter`
- `[ Save ]`

And then `Actions > Deploy API`:

- Deployment stage = `prod` (or `new stage` + stage name = `prod` if not exists)

Now you should see the `Invoke URL: https://m2toimgsc8.execute-api.us-east-1.amazonaws.com/prod`.

The `m2toimgsc8` part is your API ID, which you would use in place of `REDACTED` from the usage example.

That's it!


Support / contact
-----------------

Basic support (no guarantees) for issues / feature requests via GitHub issues.

Paid support is available via [function61.com/consulting](https://function61.com/consulting/)

Contact options (email, Twitter etc.) at [function61.com](https://function61.com/)
