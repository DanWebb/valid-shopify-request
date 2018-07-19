import test from 'ava';
import validShopifyRequest from '../dist';

test('Returns true when a valid payload object is used', async t => {
	const secret = 'hush';
	const payload = {
		code: '0907a61c0c8d55e99db179b68161bc00',
		hmac: '4712bf92ffc2917d15a2f5a273e39f0116667419aa4b6ac0b3baaf26fa3c4d20',
		shop: 'some-shop.myshopify.com',
		timestamp: '1337178173'
	};
	t.true(await validShopifyRequest(secret, payload));
});

test('Passing an invalid HMAC within the payload object throws an error', async t => {
	const message = 'Security Error - The request was not authentic'
	const secret = 'hush';
	const payload = {code: '123', hmac: '123', shop: '123', timestamp: '123'};
	await t.throws(validShopifyRequest(secret, payload), message);
});

test('Passing no hmac param in the payload throws an error', async t => {
	const secret = 'hush';
	const message = 'Security Error - The expected hmac parameter was not present';
	await t.throws(validShopifyRequest(secret, {hmac: ''}), message);
	await t.throws(validShopifyRequest(secret, {}), message);
});

test('Passing invalid options throws an error', async t => {
	const message = 'No payload or secret was provided to validate against';
	await t.throws(validShopifyRequest(), message);
	await t.throws(validShopifyRequest({}), message);
	await t.throws(validShopifyRequest(null, null), message);
	await t.throws(validShopifyRequest('secret'), message);
	await t.throws(validShopifyRequest({hmac: ''}), message);
	await t.throws(validShopifyRequest({should: 'not be an object'}, 'should not be a string'), message);
});