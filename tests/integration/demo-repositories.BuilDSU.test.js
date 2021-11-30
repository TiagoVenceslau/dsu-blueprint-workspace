
const dsuBlueprint = require('../../demo-repositories/node_modules/@tvenceslau/dsu-blueprint/lib');
const demoRepositories = require('../../demo-repositories/lib');
const decValidation = require('../../demo-repositories/node_modules/@tvenceslau/decorator-validation/lib');
const {isEqual} = decValidation;

const {KeySSIType, OpenDSURepository} = dsuBlueprint;
const {BuildDsuBlueprint} = demoRepositories;

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'default';
let testName = 'Build DSU Blueprint';

const defaultOps = {
    timeout: 1000,
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
            'mount ../themes/*/seed /themes/*');
        callback();
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    let buildDSU = new BuildDsuBlueprint();
    let errs = buildDSU.hasErrors();

    tr.assert.true(errs === undefined, "BuildDSU shows errors");
    const repo = new OpenDSURepository(BuildDsuBlueprint, "default", '../../dsu-blueprint');
    repo.create(buildDSU, (err, newModel, dsu, keySSI) => {
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
