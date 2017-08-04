require("babel-polyfill");

import fs from 'fs-extra';
import D2L from 'valence';
import config from './config.json';
import https from 'https';

class App {
    static main() {
        const HOST = 'https://courses.ashworthcollege.edu';
        const PORT = 443;

        const appContext = new D2L.ApplicationContext(config.appId, config.appKey);
        const userContext = appContext.createUserContextWithValues(HOST, PORT, config.userId, config.userKey);

        // const urlForAuth = userContext.createAuthenticatedUrl('/d2l/auth/api/token', 'GET');
        // console.log(urlForAuth);
        // https.get(urlForAuth, (response) => {
        //     console.log(response.statusCode);
        //     response.on('data', (data) => {
        //         process.stdout.write(data);
        //     });
        // });

        // const versionRequestUrl = userContext.createAuthenticatedUrl('/d2l/api/lp/1.2/users/whoami', 'GET');
        // console.log(versionRequestUrl);
        // https.get(versionRequestUrl, (response) => {
        //     console.log(response.statusCode);
        //     response.on('data', (data) => {
        //         process.stdout.write(data);
        //     });
        // });
    }
}

App.main();