require('babel-polyfill');

import request from 'request-promise-native';
import tough from 'tough-cookie';

class Sakai {
    async getLoginCookie(username, password) {
        const options = {
            uri: 'https://study.ashworthcollege.edu/direct/session',
            resolveWithFullResponse: true,
        };
        const cookieKey = 'SAKAIID';
        return request.post(options)
            .form({
                _username: username,
                _password: password,
            })
            .then((response) => {
                const sakaiCookie = response.headers['set-cookie'][0];
                return {
                    key: cookieKey,
                    value: sakaiCookie.substring(sakaiCookie.lastIndexOf(`${cookieKey}=`) + cookieKey.length + 1, sakaiCookie.indexOf(';')),
                };
            });
    }

    async getAssignments(siteUuid, loginCookie) {
        const host = 'https://study.ashworthcollege.edu';

        const cookie = new tough.Cookie({
            key: loginCookie.key,
            value: loginCookie.value,
            domain: 'study.ashworthcollege.edu',
            httpOnly: true,
            maxAge: 31536000
        });

        const jar = request.jar();
        jar.setCookie(cookie, host);

        const options = {
            url: `${host}/direct/assignment/site/${siteUuid}.json`,
            jar,
        };
        return request.get(options)
            .then((responseBody) => {
                return JSON.parse(responseBody);
            });
    }
}

export default Sakai;