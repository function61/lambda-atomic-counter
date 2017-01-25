var atomicCounter = require('dynamodb-atomic-counter');

function handleError(callback, errorCode) {
	callback(null, {
		statusCode: 200,
		body: JSON.stringify({ error_code: errorCode })
	});
}

var apis = {
	'POST /counter/increment': function (event, context, callback) {
		if (!event.queryStringParameters.counter) {
			handleError(callback, 'counter_not_specified');
			return;
		}

		var counter = event.queryStringParameters.counter;

		callback(null, {
			statusCode: 200,
			body: JSON.stringify({ counter: counter, new_value: 1234 })
		});
	},

	'Unsupported event': function (event, context, callback) {
		handleError(callback, 'unsupported_event');
	},

	'API not found': function (event, context, callback) {
		handleError(callback, '404_not_found');
	}
}

exports.handler = function(event, context, callback) {
	var operation = 'Unsupported event';

	// HTTP request via API gateway, api = "<HTTP_METHOD> <URL>", example: "POST /ingest"
	if (event.httpMethod) {
		var apiName = event.httpMethod + ' ' + event.path;

		operation = apiName in apis ? apiName : 'API not found';
	}

	// console.log(operation + " ->");

	apis[ operation ](event, context, callback);
};

