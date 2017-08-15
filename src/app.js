const config = require('./config.json');
const request = require('request-promise-native');
const Sakai = require('./Sakai');
const Brightspace = require('./Brightspace');
const FileHandler = require('./FileHandler');

class App {
    static async process(assignmentInfo, loginCookie) {
        const sakai = new Sakai();

        const assignments = await sakai.getAssignments(assignmentInfo.guid, loginCookie);

        if (assignments.length > 0) {
            const brightspace = new Brightspace();
            const brightspaceContext = brightspace.contextFactory(config.brightspace.appId, config.brightspace.appKey, config.brightspace.userId, config.brightspace.userKey);

            for (let assignment of assignments) {
                const attachments = await sakai.getAssignmentAttachmentInfo(assignment, loginCookie);
                for (let attachment of attachments) {
                    console.log(attachment);
                    await sakai.downloadAssignmentAttachment(attachment.url, `${config.workingFolder}\\${assignment.id}\\${attachment.name}`);
                }
            }

            // assignments.forEach(async (assignment) => {
            //     await brightspace
            //         .createDropboxFolder(assignment.title, assignment.instructions, assignmentInfo.ouid, brightspaceContext)
            //         .catch((error) => {
            //             console.log(error);
            //             throw error;
            //         });
            //     console.log(`Created assignment ${assignment.title} in OUID ${assignmentInfo.ouid}.`);
            // });
        }
    }

    static async main() {
        console.time('main');

        const fileHandler = new FileHandler();
        const assignments = await fileHandler.readCsv(`${config.workingFolder}\\assignments.csv`);

        // https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable
        const fields = Object.keys(assignments[0]);
        const header = fields.join(',');
        if (!header.includes('guid') || !header.includes('ouid')) {
            throw 'File must have column headers "guid" and "ouid" exactly.';
        }

        const sakai = new Sakai();
        const loginCookie = await sakai.getLoginCookie(config.sakai.userId, config.sakai.password);

        if (loginCookie) {
            const replacer = (key, value) => { return value === null ? '' : value }
            const outputCsvFile = `${config.workingFolder}\\assignments-output.csv`;

            for (let assignment of assignments) {
                await App.process(assignment, loginCookie);

                const csv = fields.map((fieldName) => {
                    return JSON.stringify(assignment[fieldName], replacer)
                }).join(',');

                await fileHandler.appendStringToPath(`${csv}\r\n`, outputCsvFile);
            }
        }
        else {
            console.log("Could not retrieve assignments. Perhaps config.json is missing or has incorrect sakai.userId or sakai.password. Continuing...");
        }

        console.log('Done with batch.');
        console.timeEnd('main');
    }
}

App.main();