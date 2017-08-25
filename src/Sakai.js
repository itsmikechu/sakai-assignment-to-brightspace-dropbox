const request = require('request-promise-native');
const FileHandler = require('./FileHandler');
const tough = require('tough-cookie');
const path = require('path');
const fs = require('fs-extra');

const host = 'https://study.ashworthcollege.edu';

class Sakai {
    async getLoginCookie(username, password) {
        const options = {
            uri: 'https://study.ashworthcollege.edu/direct/session',
            resolveWithFullResponse: true,
        };
        const cookieKey = 'SAKAIID';
        return await request.post(options)
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
            })
            .catch(() => {
                return null;
            });
    }

    makeOptions(requestPath, loginCookie) {
        const cookie = new tough.Cookie({
            key: loginCookie.key,
            value: loginCookie.value,
            domain: 'study.ashworthcollege.edu',
            httpOnly: true,
            maxAge: 31536000
        });

        const jar = request.jar();
        jar.setCookie(cookie, host);

        return {
            url: `${host}${requestPath}`,
            jar,
        };
    }

    async getAssignments(siteUuid, loginCookie) {
        console.log(`Getting assignments from Sakai courses ${siteUuid}...`);
        return await request.get(this.makeOptions(`/direct/assignment/site/${siteUuid}.json`, loginCookie))
            .then((responseBody) => {
                return JSON.parse(responseBody).assignment_collection;
            });
    }

    async getAssignmentAttachmentInfo(assignment, loginCookie) {
        console.log(`Get attachments for assignment ${assignment.id}...`)
        return await request.get(this.makeOptions(`/direct/assignment/item/${assignment.id}.json`, loginCookie))
            .then((responseBody) => {
                return JSON.parse(responseBody).attachments;
            });
    }

    async downloadAssignmentAttachment(url, savePath, loginCookie) {
        const urlPath = url.replace(host, '');
        const fileHandler = new FileHandler();

        console.log(`Downloading attachment from ${urlPath}...`);

        await fileHandler.makeDirectory(path.dirname(savePath));

        const options = this.makeOptions(urlPath, loginCookie);
        options.resolveWithFullResponse = true;
        options.encoding = null;

        await request.get(options)
            .then((response) => {
                fs.writeFileSync(savePath, response.body);
            });
    }
}

module.exports = Sakai;