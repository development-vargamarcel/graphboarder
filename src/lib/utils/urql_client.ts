
import { createClient, fetchExchange } from '@urql/svelte';
import { amp, browser, dev, mode, prerendering } from '$app/env';
export default createClient({
    url: 'https://mdunpmb9.directus.app/graphql',
    fetchOptions: () => {
        const token = getToken();
        let authorizationHeader = {}
        if (token) {
            authorizationHeader = { authorization: token ? `Bearer ${token}` : '' }
        }

        return {
            headers: { ...authorizationHeader }
        };
    },
    exchanges: [fetchExchange]
});

let getToken = () => {
    console.log('get token run');
    if (browser) {
        return localStorage.getItem('auth_token')
    } else { return null }
};

