const fs = require('fs-extra');
const csv = require('csvtojson');

class FileHandler {
    async writeStringToPath(dataString, filePath) {
        await fs.writeFile(filePath, dataString);
    }

    async appendStringToPath(dataString, filePath) {
        await fs.appendFile(filePath, dataString);
    }

    async readCsv(csvFilePath) {
        console.log('Reading CSV file...');

        const exams = [];
        await csv()
            .fromFile(csvFilePath)
            .on('json', (exam) => {
                exams.push(exam);
            })
            .on('done', (error) => {
                if (error) {
                    throw error;
                }
                else {
                    console.log('File read.');
                }
            });
        return exams;
    }
}

module.exports = FileHandler;