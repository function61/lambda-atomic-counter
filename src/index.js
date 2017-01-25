var atomicCounter = require('dynamodb-atomic-counter');

var apis = {
	'POST /counter/increment': function (event, context, callback) {
		callback(null, {
			statusCode: 200,
			body: JSON.stringify({ new_value: 1234 })
		});
	},

	'Unsupported event': function (event, context, callback) {
		callback(null, {
			statusCode: 200,
			body: JSON.stringify({ error_code: 'unsupported_event' })
		});
	},

	'API not found': function (event, context, callback) {
		callback(null, {
			statusCode: 200,
			body: JSON.stringify({ error_code: '404_not_found' })
		});
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

