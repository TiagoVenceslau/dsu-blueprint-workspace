const dsuBlueprint = require('../dsu-blueprint/lib');

const {OpenDSUTestRunner} = require('../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint Template Test';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");
    callback()
});

