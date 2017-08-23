const request = require('request-promise-native');
const tough = require('tough-cookie');
const FileHandler = require('./FileHandler');
const fs = require('fs-extra');
const path = require('path');

const host = 'https://study.ashworthcollege.edu';

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

    getAssignments(siteUuid, loginCookie) {
        return request.get(this.makeOptions(`/direct/assignment/site/${siteUuid}.json`, loginCookie))
            .then((responseBody) => {
                return JSON.parse(responseBody).assignment_collection;
            });
    }

    getAssignmentAttachmentInfo(assignment, loginCookie) {
        return request.get(this.makeOptions(`/direct/assignment/item/${assignment.id}.json`, loginCookie))
            .then((responseBody) => {
                return JSON.parse(responseBody).attachments;
            });
    }

    async downloadAssignmentAttachment(url, savePath, loginCookie) {
        const urlPath = url.replace(host, '');
        if (fs.exists(savePath)) {
            return;
        }
        fs.mkdir(path.dirname(savePath));
        await request.get(this.makeOptions(urlPath, loginCookie, true))
            .pipe(fs.createWriteStream(savePath));
    }
}

module.exports = Sakai;