const fs = require('fs-extra');
const csv = require('csvtojson');

class FileHandler {
    async appendStringToPath(dataString, filePath) {
        await fs.appendFile(filePath, dataString);
    }

    async readCsv(csvFilePath) {
        return new Promise((resolve, reject) => {
            console.log('Reading CSV file...');

            const lines = [];
            return csv()
                .fromFile(csvFilePath)
                .on('json', (exam) => {
                    lines.push(exam);
                })
                .on('done', (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        console.log('File read.');
                        resolve(lines);
                    }
                });
        });
    }
}

module.exports = FileHandler;