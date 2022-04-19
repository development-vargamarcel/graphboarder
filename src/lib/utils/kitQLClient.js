import { KitQLClient } from '@kitql/client';

export const kitQLClient = new KitQLClient({
    url: `https://mdunpmb9.directus.app/graphql`,
    headersContentType: 'application/json',
    logType: ['client', 'server', 'operationAndvariables']
});