import D2L from 'valence';
import config from './config.json';
import request from 'request-promise-native';
import Sakai from './Sakai'

class App {
    static async main() {
        const sakai = new Sakai();
        
        const loginCookie = await sakai.getLoginCookie(config.sakai.userId, config.sakai.password);
        const assignments = await sakai.getAssignments('40d71ec5-7710-4523-9678-698d25ccbe08', loginCookie);
        console.log(assignments);
        return;

        const appContext = new D2L.ApplicationContext(config.brightspace.appId, config.brightspace.appKey);
        const userContext = appContext.createUserContextWithValues('https://courses.ashworthcollege.edu', 443, config.brightspace.userId, config.brightspace.userKey);

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