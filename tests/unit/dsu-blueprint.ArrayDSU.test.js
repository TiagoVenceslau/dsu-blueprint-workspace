const dsuBlueprint = require('../../dsu-blueprint/lib');

const {ArrayDSU, KeySSIType, ArrayDSURepository} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint ARRAY' // no spaces please. its used as a folder name

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const arrayDSU = new ArrayDSU();
    const errs = arrayDSU.hasErrors();

    tr.assert.true(errs === undefined, "SeedDSU shows errors");
    const repo = new ArrayDSURepository();
    const extraKeyArgs = [Math.floor(Math.random() * 1000).toString(), Math.floor(Math.random() * 10000).toString()]

    repo.create(arrayDSU, ...extraKeyArgs, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.ARRAY, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        callback();
    });
});

