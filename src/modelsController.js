const path = require('path')
const fs = require('fs')
const dirTree = require("directory-tree");

const basePath = path.join(__dirname, '../public/models_database')



module.exports = {
    generateDatabase: function () {


        const tree = dirTree(basePath);

        try {
            const data = fs.writeFileSync(basePath + '/models.json', JSON.stringify(tree))
            //file written successfully
        } catch (err) {
            console.error(err)
        }



    }
};