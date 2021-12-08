
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const decoratorValidation = require('../../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const dsuBlueprintTests = require('../../../dsu-blueprint/lib/tests');
const {isEqual} = decoratorValidation;

const {KeySSIType, OpenDSURepository} = dsuBlueprint;
const {SeedDSUBlueprint} = dsuBlueprintTests;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint SEED';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, model, callback){

    const readFile = function(dsu, path, callback){
        dsu.readFile(path, (err, data) => {
            if (err)
                return callback(err);
            try{
                data = JSON.parse(data);
            } catch (e){
                return callback(e);
            }
            callback(undefined, data);
        });
    }

    readFile(dsu, "info.json", (err, data) => {
        if (err)
            return callback(err);
        tr.assert.true(isEqual(data, {
            name: model.name,
            count: model.count
        }), "info.json File contents are wrong");

        readFile(dsu, "__metadata.json", (err, data) => {
            if (err)
                return callback(err);
            tr.assert.true(isEqual(data, {
                createdOn: model.createdOn.toString()
            }), "__metadata.json File contents are wrong");

            readFile(dsu, "metadata.json", (err, data) => {
                if (err)
                    return callback(err);
                tr.assert.true(isEqual(data, {
                    updatedOn: model.updatedOn.toString()
                }), "metadata.json File contents are wrong");

                callback();
            });
        });
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const seedBlueprint = new SeedDSUBlueprint({
        name: "tests",
        count: 5
    });

    let errs = seedBlueprint.hasErrors(undefined, "createdOn", "updatedOn");
    tr.assert.true(errs === undefined, "SeedDSU shows errors before create");

    const repo = new OpenDSURepository(SeedDSUBlueprint);
    repo.create(seedBlueprint, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(newModel instanceof SeedDSUBlueprint, "Updated model is not of the same class")
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');

        errs = newModel.hasErrors();
        tr.assert.true(errs === undefined, "SeedDSUBlueprint shows errors after create");

        testDSUStructure(dsu, newModel, callback);
    });
});
