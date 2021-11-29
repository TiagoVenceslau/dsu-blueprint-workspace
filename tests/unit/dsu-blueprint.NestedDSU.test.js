
const dsuBlueprint = require('../../dsu-blueprint/lib');

const {DbDsuBlueprint, KeySSIType, DbDSURepository, getKeySsiSpace} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint NESTED';

const defaultOps = {
    timeout: 10000000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, callback){
    dsu.listMountedDSUs('/', (err, mounts) => {
        tr.assert.true(!err);
        tr.assert.true(mounts && Object.keys(mounts).length === 1 && mounts[0].path === "data");
        let ssi;
        try {
            ssi = getKeySsiSpace().parse(mounts[0].identifier)
        } catch (e) {
            return callback(e)
        }

        tr.assert.true(ssi !== undefined, "KeySSI is undefined");
        tr.assert.true(ssi.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(ssi.getDLDomain() === 'default', 'KeySSI is of different domain');

        callback();
    });
}

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
        testDSUStructure(dsu, callback);
    });
});
