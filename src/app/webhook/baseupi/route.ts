import { POST as mainWebhookHandler } from '../../api/webhook/route';

/**
 * Proxy handler for backward compatibility with older BaseUPI dashboard settings.
 * Redirects all requests to the consolidated /api/webhook handler.
 */
export const POST = mainWebhookHandler;
