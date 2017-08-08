require('babel-polyfill');

import D2L from 'valence';
import request from 'request-promise-native';

class Brightspace {
    contextFactory(appId, appKey, userId, userKey) { 
        return (new D2L.ApplicationContext(appId, appKey))
            .createUserContextWithValues('https://courses.ashworthcollege.edu', 443, userId, userKey);
    }

    async getUser(userId, context) {  // for the purposes of testing, I'm trying to GET info a user
        const method = 'GET'
        const uri = context.createAuthenticatedUrl(`/d2l/api/lp/1.17/users/${userId}`, method);

        console.log(`Brightspace URL to call: ${uri}`);
        console.log(`Brightspace URL has auth in it: ${D2L.Auth.isAuthenticated(uri)}`);

        const options = {
            method,
            uri,
            resolveWithFullResponse: true,
        };

        return request.get(options);
    }
}

export default Brightspace;