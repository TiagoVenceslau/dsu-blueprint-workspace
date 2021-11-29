
const dsuBlueprint = require('../../dsu-blueprint/lib');
const decValidation = require('../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const {isEqual} = decValidation;

const {IdDsuBlueprint, KeySSIType, OpenDSURepository, DsuKeys} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint File contents';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, originalData, callback){
    dsu.readFile(DsuKeys.DEFAULT_DSU_PATH, (err, data) => {
        if (err)
            return callback(err);
        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        tr.assert.true(isEqual(data, originalData), "Data does not match");
        callback();
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const data = {
        name: "test",
        id: "test",
        email: "test",
        address: "test"
    }

    let idDSU = new IdDsuBlueprint({
        name: "test",
        id: "test",
        email: "test",
        address: "test"
    });
    let errs = idDSU.hasErrors();

    tr.assert.true(errs !== undefined, "Email was not validated properly");

    data.email = "test@test.com";

    idDSU = new IdDsuBlueprint(data);
    errs = idDSU.hasErrors();

    tr.assert.true(errs === undefined, "IdDSU shows errors");
    const repo = new OpenDSURepository(IdDsuBlueprint);
    repo.create(idDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        testDSUStructure(dsu, data, callback);
    });
});
