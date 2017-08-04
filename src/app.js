require("babel-polyfill");

import fs from 'fs-extra';
import D2L from 'valence';
import config from './config.json';

class App {
    static main() {
        const userContext = new D2L.UserContext({
            host : 'courses.ashworthcollege.edu',
            port : 443,
            userId : config.userId,
            userKey : config.userKey,
            appId : config.appId,
            appKey : config.appKey,
        });
        console.log(userContext.createAuthenticatedUrl('/path', 'GET'));
    }
}

App.main();