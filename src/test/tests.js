var assert = require('assert')
  , url = require('url')
  , index = require('../index');

function makeRequest(spec) { // convenience method to reduce test boilerplate
	var parsed = /^(GET|POST) (.+)/.exec(spec);

	var urlParsed = url.parse(parsed[2], true);

	return {
		httpMethod: parsed[1],
		path: urlParsed.pathname,
		queryStringParameters: urlParsed.query
	};
}

// override the productionIncrementAdapter(), so our tests return
// consistent results and not try to hit the actual database
global.incrementAdapter = function testingIncrementAdapter(counter, next) {
	if (counter === 'counter_that_fails') {
		next(new Error('Fictional error connecting to database'));
	} else {
		next(null, 123);
	}
}

describe('testing-internal helper: makeRequest', function (){
	it('should parse query strings', function (){
		assert.equal(JSON.stringify(makeRequest('GET /person?name=joonas')), '{"httpMethod":"GET","path":"/person","queryStringParameters":{"name":"joonas"}}');
	});

	it('should work without a query string', function (){
		assert.equal(JSON.stringify(makeRequest('GET /person')), '{"httpMethod":"GET","path":"/person","queryStringParameters":{}}');
	});
});

describe('Lambda service', function (){
	it('should handle 404 gracefully', function (done){
		index.handler(makeRequest('GET /foo'), null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"error_code":"404_not_found"}');

			done();
		})
	});

	it('should handle unknown event gracefully', function (done){
		index.handler({ unknown: 'event' }, null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"error_code":"unsupported_event"}');

			done();
		})
	});

	it('should handle increment', function (done){
		index.handler(makeRequest('POST /counter/increment?counter=poop'), null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"counter":"poop","new_value":123}');

			done();
		})
	});

	it('should return errors gracefully', function (done){
		index.handler(makeRequest('POST /counter/increment?counter=counter_that_fails'), null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"error_code":"error_incrementing_probably_database_error","error_description":"Error: Fictional error connecting to database"}');

			done();
		})
	});

	it('should abort increment if counter not specified', function (done){
		index.handler(makeRequest('POST /counter/increment'), null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"error_code":"counter_not_specified"}');

			done();
		})
	});
});
