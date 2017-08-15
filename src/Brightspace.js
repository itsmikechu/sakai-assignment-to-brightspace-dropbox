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

        const nightmare = new Nightmare({ show: true });

        const selector = '.d2l-datalist-style1';
        await nightmare
            .goto('https://courses.ashworthcollege.edu/d2l/login')
            .type('#userName', serviceAccount.username)
            .type('#password', serviceAccount.password)
            .click('button[primary]')
            .wait('.d2l-navigation-s-personal-menu')
            .goto(`https://courses.ashworthcollege.edu/d2l/lms/dropbox/admin/modify/folder_newedit_properties.d2l?db=${assignment.brightspaceAssignmentId}&ou=${targetOuid}`)
            .wait('#z_bv') // Add a File button (which renders 3 ordinal [id] sooner in electron :shrug:)
            .click('#z_bv')
            .wait(2000)  // Dialog appears
            .evaluate((selector) => {
                debugger;
                return document.querySelector(selector).innerHtml;
            }, selector)
            .then((insides)=>{
                console.log(insides);
            });
            // .click('.vui-list > li:nth-child(1) > div:nth-child(1)') // source from My Computer
            // .wait('.d2l-fileinput-addbuttons > button') // Drop files here, or click below! appears
            // .click('.d2l-fileinput-addbuttons > button') // Upload button
            // // upload a file somehow
            // .wait('ul.d2l-fileinput-filelist > li[data-d2l-name]')
            // .click('table.d2l-dialog-buttons button[primary]') // Add button
            // .wait(5000) // 5 arbitrary seconds
            // .click('#z_a') // Save and Close
            // .wait('#d2l_1_22_198') // New Submission Folder button appears
            // .end()
            // .then(() => {
            //     console.log('There');
            // });
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