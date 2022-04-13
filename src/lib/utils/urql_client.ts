
import { createClient, fetchExchange } from '@urql/svelte';
import { amp, browser, dev, mode, prerendering } from '$app/env';
export default createClient({
    url: 'https://mdunpmb9.directus.app/graphql',
    fetchOptions: () => {
        const token = getToken();
        return {
            headers: { authorization: token ? `Bearer ${token}` : '' }
        };
    },
    exchanges: [fetchExchange]
});

let getToken = () => {
    console.log('get token run');
    if (browser) {
        return localStorage.getItem('auth_token')
    }
};

