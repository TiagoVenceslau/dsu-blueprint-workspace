process.exit(0);
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');

const {KeySSIType, OpenDSURepository, getKeySsiSpace} = dsuBlueprint;
const {SSAppDsuBlueprint} = dsuBlueprintTest;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');


let domain = 'default';
let testName = 'SSApp DSU Blueprint';

const defaultOps = {
    timeout: 1000000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, callback){

    dsu.readFile("init.file", (err, data) => {
        if (err)
            return callback(err);
        try{
            data = data.toString();
        } catch (e){
            return callback(e);
        }

        tr.assert.true(data === 'delete /\n' +
            'addfolder code\n' +
            'mount ../cardinal/seed /cardinal\n' +
            'mount ../themes/*/seed /themes/*', "File contents are wrong");

        dsu.listFolders('/', (err, folders) => {
            if (err)
                return callback(err);
            tr.assert.true(folders && folders.length, "Folder count does not match");
            tr.assert.true(folders[0] === 'code', "Folder name is wrong");

            dsu.listMountedDSUs('/', (err, mounts) => {
                if (err)
                    return callback(err);
                tr.assert.true(mounts && mounts.length === 2 && mounts[0].path === 'webcardinal', "Cant find webcardinal");
                tr.assert.true(mounts[1].path = 'themes/blue-fluorite-theme', 'cant find Blue Flourite theme');
                try{
                    const cardinalSSI = getKeySsiSpace().parse(mounts[0].identifier);
                    tr.assert.true(cardinalSSI.getTypeName() === 'sread');

                    const themeSSI = getKeySsiSpace().parse(mounts[1].identifier);
                    tr.assert.true(themeSSI.getTypeName() === 'sread');
                } catch (e) {
                    return callback(e);
                }

                callback();
            });
        });
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const id = {
        id: "testID" + Math.floor(Math.random() * 10000),
        name: "testName",
        email: "test@test.com",
        address: "test address"
    }

    let ssAppDSU = new SSAppDsuBlueprint({
        id: id
    });

    let errs = ssAppDSU.hasErrors();

    tr.assert.true(errs === undefined, "BuildDSU shows errors");
    const repo = new OpenDSURepository(SSAppDsuBlueprint, "default", '../../../dsu-blueprint');
    repo.create(ssAppDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        testDSUStructure(dsu, callback);
    });
});