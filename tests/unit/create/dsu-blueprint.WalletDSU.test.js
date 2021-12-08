process.exit(0) // TODO: Ignore for now. Needs working SSApp

const dsuBlueprint = require('../../../dsu-blueprint/lib');

const {WalletDSU, KeySSIType, OpenDSURepository} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint WALLET';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const walletDSU = new WalletDSU();
    const errs = walletDSU.hasErrors();

    tr.assert.true(errs === undefined, "WalletDSU shows errors");
    const repo = new OpenDSURepository(WalletDSU);
    const extraKeyArgs = [Math.floor(Math.random() * 1000).toString(), Math.floor(Math.random() * 10000).toString()]

    repo.create(walletDSU, ...extraKeyArgs, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(newModel instanceof WalletDSU, "Updated model is not of the same class")
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.WALLET, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        callback();
    });
});

