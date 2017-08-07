require("babel-polyfill");

import D2L from 'valence';
import config from './config.json';
import request from 'request-promise-native';

class App {
    static main() {
        const HOST = 'https://courses.ashworthcollege.edu';
        const PORT = 443;

        const appContext = new D2L.ApplicationContext(config.appId, config.appKey);

        const userContext = appContext.createUserContextWithValues(HOST, PORT, config.userId, config.userKey);

        const url = userContext.createAuthenticatedUrl('/d2l/api/lp/1.17/users/223', 'GET');
        console.log(url);
        console.log(D2L.Auth.isAuthenticated(url));
        request.get(url)
            .then((response) => {
                console.log("Response Body (hopefully JSON)", response.body);
            })
            .catch((response) => {
                console.log("Error", response.statusCode, response.error);
            });
    }
}

App.main();