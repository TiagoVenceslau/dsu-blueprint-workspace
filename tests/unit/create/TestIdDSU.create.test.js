
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');
const decValidation = require('../../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const {isEqual} = decValidation;

const {KeySSIType, OpenDSURepository, DsuKeys} = dsuBlueprint;
const {TestIdDsuBlueprint} = dsuBlueprintTest;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint File contents CREATE';

const defaultOps = {
    timeout: 10000000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, originalData, otherData, callback){
    dsu.readFile(DsuKeys.DEFAULT_DSU_PATH, (err, data) => {
        if (err)
            return callback(err);
        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        tr.assert.true(isEqual(data, originalData), "Data does not match");

        dsu.readFile("createdOn", (err, data) => {
            if (err || !data)
                return callback(err || "Missing data");
            data = typeof data === 'string' ? data : data.toString();
            try{
                data = new Date(data);
            } catch(e){
                return callback(e);
            }
            tr.assert.true(!!data, "Invalid date");

            dsu.readFile("environment.json", (err, data) => {
                if (err)
                    return callback(err);
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return callback(e);
                }

                tr.assert.true(isEqual(data, otherData), "Environment Data does not match");
                callback();
            });
        });
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const data = {
        name: "test",
        email: "email@email.com"
    }
    const otherData = Object.assign({}, data, {
        environment: {
            property: "test"
        }
    });

    const idDSU = new TestIdDsuBlueprint(otherData);

    const errs = idDSU.hasErrors("createdOn");

    tr.assert.true(errs === undefined, "TestIdDSU shows errors");
    const repo = new OpenDSURepository(TestIdDsuBlueprint);
    repo.create(idDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(newModel instanceof TestIdDsuBlueprint, "Updated model is not of the same class");
        tr.assert.true(newModel !== idDSU, "Instances are the same after creation")
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        testDSUStructure(dsu, data, otherData, callback);
    });
});
