
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const decoratorValidation = require('../../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');


const {OpenDSURepository} = dsuBlueprint;
const {SeedDSUBlueprint} = dsuBlueprintTest;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint SEED READ';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const NAME = "Testing", COUNT = 5;

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const seedDSU = new SeedDSUBlueprint({
        name: NAME,
        count: COUNT
    })

    const errs = seedDSU.hasErrors(undefined, "createdOn", "updatedOn");
    tr.assert.true(!errs, "Model is not validating properly before create");

    const repo = new OpenDSURepository(SeedDSUBlueprint);
    repo.create(seedDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        const errs = newModel.hasErrors();
        tr.assert.true(!errs, "Model is not validating properly after create");

        repo.read(keySSI, (err, readModel) => {
            if (err || !readModel)
                return callback(err || new Error(`No model`));

            tr.assert.true(readModel instanceof SeedDSUBlueprint, "Received Model not of same class")
            tr.assert.true(readModel.equals(newModel), "Model from create does not match model from read");
            callback();
        });
    });
});
