
const dsuBlueprint = require('../../../dsu-blueprint/lib');

const {KeySSIType, OpenDSURepository, SeedDSU} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint SEED CREATE';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const seedDSU = new SeedDSU();
    const errs = seedDSU.hasErrors();

    tr.assert.true(errs === undefined, "SeedDSU shows errors");
    const repo = new OpenDSURepository(SeedDSU);
    repo.create(seedDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(newModel instanceof SeedDSU, "Updated model is not of the same class");
        tr.assert.true(newModel !== seedDSU, "Instances are the same after creation")
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        callback();
    });
});
