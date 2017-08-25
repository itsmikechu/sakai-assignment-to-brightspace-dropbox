const D2L = require('valence');
const request = require('request-promise-native');
const Nightmare = require('nightmare');
const path = require('path');
const mime = require('mime-types');
const fs = require('fs-extra');
const dav = require('webdav-fs');

class Brightspace {
    contextFactory(appId, appKey, userId, userKey) {
        return (new D2L.ApplicationContext(appId, appKey))
            .createUserContextWithValues('https://courses.ashworthcollege.edu', 443, userId, userKey);
    }

    async linkAssignmentAttachment(assignment, targetOuid, serviceAccount) {
        if (!serviceAccount.username || !serviceAccount.password) {
            throw "No service account credentials supplied. Make sure they're present in the config.json";
        }
        
        const firstAttachment = assignment.attachments[0];
        const filename = path.win32.basename(firstAttachment.savePath);
        
        console.log(`Linking attachment ${filename} to assignment ${assignment.brightspaceAssignmentId} in course ${targetOuid}...`);

        require('nightmare-iframe-manager')(Nightmare);
        require('nightmare-upload')(Nightmare);

        const nightmare = new Nightmare({ show: false });
        return await nightmare
            .goto('https://courses.ashworthcollege.edu/d2l/login')
            .type('#userName', serviceAccount.username)
            .type('#password', serviceAccount.password)
            .click('button[primary]')
            .wait(1000)
            .goto(`https://courses.ashworthcollege.edu/d2l/lms/dropbox/admin/modify/folder_newedit_properties.d2l?db=${assignment.brightspaceAssignmentId}&ou=${targetOuid}`)
            .wait('#z_bv') // Add a File button (which renders 3 ordinal [id] sooner in Electron :shrug:)
            .click('#z_bv')
            .wait('.ddial_c_frame')
            .wait(2000) // iframe loads slowly
            .enterIFrame('.ddial_c_frame')
            .evaluate(() => {
                document.querySelector('div[title="Course Offering Files"]').click(); // source from Course Offering Files
            })
            .wait(1000)
            .evaluate(() => {
                document.querySelector('a[onclick*="assignments"]').click(); // click assignments folder
            })
            .wait(1000)
            .evaluate((filename) => {
                document.querySelector(`input[value*="${filename}"]`).click(); // click the file(s) checkbox
            }, filename)
            .exitIFrame()
            .click('table.d2l-dialog-buttons button[primary]') // Add button
            .wait(1000) // arbitrary seconds 
            .click('#z_a') // Save and Close
            .wait('a[title="Quick Edit Folders"') // We've returned to the Assignment Submission Folders
            .end();
    }

    async uploadAssignmentAttachmentToDav(assignment, davUrl, davUsername, davPassword, davPath) {
        const firstAttachment = assignment.attachments[0];
        const filename = path.win32.basename(firstAttachment.savePath);
        const wfs = dav(davUrl, davUsername, davPassword);

        console.log(`Uploading file to WebDAV ${davUrl}/${davPath}/${filename} ...`);

        await wfs.mkdir(`/${davPath}`, () => { });

        return await wfs.readFile(`/${davPath}/${filename}`, (error, data) => {
            if (data) {
                return;
            }
            else {
                fs.createReadStream(firstAttachment.savePath).pipe(wfs.createWriteStream(`/${davPath}/${filename}`));
            }
        });
    }

    async createDropboxFolder(assignment, targetOuid, context) {
        console.log('Creating dropbox/assignment folder...');
        const dropboxFolderUpdateData = {
            CategoryId: null,
            Name: assignment.title,
            CustomInstructions: {
                Type: 'Html',
                Content: assignment.instructions,
            },
            Availability: null,
            GroupTypeId: null,
            DueDate: null,
            DisplayInCalendar: false,
            NotificationEmail: null,
            IsHidden: false,
        };
        const uri = context.createAuthenticatedUrl(`/d2l/api/le/1.25/${targetOuid}/dropbox/folders/`, 'POST');

        const options = {
            uri,
            body: JSON.stringify(dropboxFolderUpdateData),
        };

        return request.post(options)
            .then((responseBody) => {
                return JSON.parse(responseBody).Id;
            });
    }

    async getCourseInformation(ouid, context) {
        console.log('Getting course information.');
        const uri = context.createAuthenticatedUrl(`/d2l/api/lp/1.18/courses/${ouid}`, 'GET');

        const options = {
            uri,
        };

        return request.get(options)
            .then((responseBody) => {
                return JSON.parse(responseBody);
            });
    }
}

module.exports = Brightspace;