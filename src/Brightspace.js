require('babel-polyfill');

import D2L from 'valence';
import request from 'request-promise-native';

class Brightspace {
    contextFactory(appId, appKey, userId, userKey) {
        return (new D2L.ApplicationContext(appId, appKey))
            .createUserContextWithValues('https://courses.ashworthcollege.edu', 443, userId, userKey);
    }

    async createDropboxFolder(assignmentName, instructions, context) {
        const dropboxFolderUpdateData = {
            CategoryId: null,
            Name: assignmentName,
            CustomInstructions: {
                Text: instructions,
                Html: `<p>${instructions}</p>`,
            },
            Availability: null,
            GroupTypeId: null,
            DueDate: null,
            DisplayInCalendar: false,
            NotificationEmail: null,
            IsHidden: null,
        };
        const uri = context.createAuthenticatedUrl('/d2l/api/le/1.25/6649/dropbox/folders/', 'POST');

        const options = {
            uri,
            body: JSON.stringify(dropboxFolderUpdateData),
        };

        return request.post(options);
    }
}

export default Brightspace;