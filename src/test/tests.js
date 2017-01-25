var assert = require('assert')
  , index = require('../index');

describe('tests', function (){
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
