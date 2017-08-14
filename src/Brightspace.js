const D2L = require('valence');
const request = require('request-promise-native');

class Brightspace {
    contextFactory(appId, appKey, userId, userKey) {
        return (new D2L.ApplicationContext(appId, appKey))
            .createUserContextWithValues('https://courses.ashworthcollege.edu', 443, userId, userKey);
    }

    async createDropboxFolder(assignmentName, htmlInstructions, targetOuid, context) {
        const dropboxFolderUpdateData = {
            CategoryId: null,
            Name: assignmentName,
            CustomInstructions: {
                Type: 'Html',
                Content: htmlInstructions,
            },
            Availability: null,
            GroupTypeId: null,
            DueDate: null,
            DisplayInCalendar: false,
            NotificationEmail: null,
            IsHidden: false,
        };
        const uri = context.createAuthenticatedUrl(`d2l/api/le/1.25/${targetOuid}/dropbox/folders/`, 'POST');

        const options = {
            uri,
            body: JSON.stringify(dropboxFolderUpdateData),
        };

        return request.post(options);
    }
}

module.exports = Brightspace;