var atomicCounter = require('dynamodb-atomic-counter');

function handleError(callback, httpCode, errorCode, err) {
	var struct = { error_code: errorCode };

	if (err) {
		struct.error_description = err.toString();
	}

	callback(null, {
		statusCode: httpCode,
		body: JSON.stringify(struct)
	});
}

// not used by tests
function productionIncrementAdapter(counter, next) {
	atomicCounter.increment(counter).done(function (value) {
		next(null, value);
	}).fail(next);	
}

var apis = {
	'POST /counter/increment': function (event, context, callback) {
		if (!event.queryStringParameters.counter) {
			handleError(callback, 400, 'counter_not_specified');
			return;
		}

		var counter = event.queryStringParameters.counter;

		var incrementAdapter = global.incrementAdapter || productionIncrementAdapter;

		incrementAdapter(counter, function (err, value){
			if (err) {
				handleError(callback, 500, 'error_incrementing_probably_database_error', err);
				return;
			}

			callback(null, {
				statusCode: 200,
				body: JSON.stringify({ counter: counter, new_value: value })
			});
		})
	},

	'Unsupported event': function (event, context, callback) {
		handleError(callback, 400, 'unsupported_event');
	},

	'API not found': function (event, context, callback) {
		handleError(callback, 404, '404_not_found');
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

