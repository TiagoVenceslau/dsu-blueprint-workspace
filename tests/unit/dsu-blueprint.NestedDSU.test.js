
const dsuBlueprint = require('../../dsu-blueprint/lib');

const {DbDsuBlueprint, KeySSIType, DbDSURepository} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint NESTED';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const dbDSU = new DbDsuBlueprint();
    const errs = dbDSU.hasErrors();

    tr.assert.true(errs === undefined, "DbDSU shows errors");
    const repo = new DbDSURepository();
    repo.create(dbDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        callback();
    });
});
