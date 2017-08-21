const D2L = require('valence');
const request = require('request-promise-native');
const Nightmare = require('nightmare');

class Brightspace {
    contextFactory(appId, appKey, userId, userKey) {
        return (new D2L.ApplicationContext(appId, appKey))
            .createUserContextWithValues('https://courses.ashworthcollege.edu', 443, userId, userKey);
    }

    async uploadAssignmentAttachments(assignment, targetOuid, serviceAccount) {
        if (!serviceAccount.username || !serviceAccount.password) {
            throw "No service account credentials supplied. Make sure they're present in the config.json";
        }

        require('nightmare-iframe-manager')(Nightmare);
        require('nightmare-upload')(Nightmare);

        const nightmare = new Nightmare({ show: true });
        await nightmare
            .goto('https://courses.ashworthcollege.edu/d2l/login')
            .type('#userName', serviceAccount.username)
            .type('#password', serviceAccount.password)
            .click('button[primary]')
            .wait('.d2l-navigation-s-personal-menu')
            .goto(`https://courses.ashworthcollege.edu/d2l/lms/dropbox/admin/modify/folder_newedit_properties.d2l?db=${assignment.brightspaceAssignmentId}&ou=${targetOuid}`)
            .wait('#z_bv') // Add a File button (which renders 3 ordinal [id] sooner in Electron :shrug:)
            .click('#z_bv')
            .wait('.ddial_c_frame')
            .wait(2000)
            .enterIFrame('.ddial_c_frame')
            //.click('div[title="My Computer"]') 
            .evaluate(function () {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        document.querySelector('div[title="My Computer"]').click(); // source from My Computer
                        resolve();
                    }, 1000);
                })
            })
            .wait('.d2l-fileinput-addbuttons > button') // Drop files here, or click below! appears
            .upload('.d2l-fileinput-input', assignment.savePath)
            .wait('ul.d2l-fileinput-filelist > li[data-d2l-name]')
            .exitIFrame() 
            .click('table.d2l-dialog-buttons button[primary]') // Add button
            .wait(5000) // 5 arbitrary seconds
            .click('#z_a') // Save and Close
            .wait('#d2l_1_22_198') // New Submission Folder button appears
            .end()
            .then((result) => {
                console.log(result);
            });
    }

    async createDropboxFolder(assignment, targetOuid, context) {
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
}

module.exports = Brightspace;