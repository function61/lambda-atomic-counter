var assert = require('assert')
  , url = require('url')
  , index = require('../index');

function makeRequest(spec) { // convenience method to remove test boilerplate
	var parsed = /^(GET|POST) (.+)/.exec(spec);

	var urlParsed = url.parse(parsed[2], true);

	return {
		httpMethod: parsed[1],
		path: urlParsed.pathname,
		queryStringParameters: urlParsed.query
	};
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
		index.handler({
			httpMethod: 'GET',
			path: '/foo'
		}, null, function (err, resp){
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
		index.handler({
			httpMethod: 'POST',
			path: '/counter/increment'
		}, null, function (err, resp){
			if (err) { throw err; }

			assert.equal(resp.statusCode, 200);
			assert.equal(resp.body, '{"new_value":1234}');

			done();
		})
	});
});
