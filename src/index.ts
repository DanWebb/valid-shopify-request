import {IncomingMessage} from 'http';
import crypto from 'crypto';
import hmacFromQuery from './hmac-from-query';
import hmacFromBody from './hmac-from-body';
import Payload from './types/payload';
import Hmacs from './types/hmacs';

/**
 * Validate a Shopify request using the HMAC parameter Shopify sends.
 * @param secret The Shopify apps secret
 * @param payload The node req object for webhooks or query object for authentication
 */
const validShopifyRequest = async (secret: string, payload: Payload | IncomingMessage): Promise<boolean> => {
	let hmac = {} as Hmacs;

	if (typeof secret !== 'string' || typeof payload !== 'object' || !secret) {
		throw new Error('No payload or secret was provided to validate against');
	}

	if (typeof (payload as IncomingMessage).headers === 'object') {
		hmac = await hmacFromBody(secret, payload as IncomingMessage);
	} else {
		hmac = hmacFromQuery(secret, payload as Payload);
	}

	try {
		if (!crypto.timingSafeEqual(hmac.shopify, hmac.generated)) {
			throw new Error('Security Error - The request was not authentic');
		}
	} catch (err) {
		err.message = 'Security Error - The request was not authentic';
		throw err;
	}

	return true;
};

export = validShopifyRequest;
