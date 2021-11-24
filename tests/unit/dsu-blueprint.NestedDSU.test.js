//process.exit(0) // ignore the template in tests....

process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const dsuBlueprint = require('../../dsu-blueprint/lib');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");
const {DbDSURepository} = require("../../dsu-blueprint/lib/repository/builtins");

const {argParser, KeySSIType, SeedDSURepository, DbDsuBlueprint} = dsuBlueprint;

let domain = 'default';
let testName = 'dsu-blueprint-NestedDSU' // no spaces please. its used as a folder name

const DOMAIN_CONFIG = {
    anchoring: {
        type: "FS",
        option: {
            enableBricksLedger: false,
        },
        commands: {
            addAnchor: "anchor",
        },
    },
    enable: ["mq"],
};

const getBDNSConfig = function(folder){
    return {
        maxTries: 10,
        storageFolder: folder,
        domains: [
            {
                name: domain,
                config: DOMAIN_CONFIG,
            },
        ],
    }
}

const defaultOps = {
    timeout: 100000,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

const testNestedDSUs = function(callback){
    const dbDSU = new DbDsuBlueprint();
    const errs = dbDSU.hasErrors();

    assert.true(errs === undefined, "DbDSU shows errors");
    const repo = new DbDSURepository();
    repo.create(dbDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        assert.true(newModel !== undefined, "Updated Model is undefined");
        assert.true(dsu !== undefined, "DSU is undefined");
        assert.true(keySSI !== undefined, "KeySSI is undefined");
        assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        callback();
    });
}

const runTest = function(callback){
    assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");
    testNestedDSUs(callback);
}

const testFinishCallback = function(callback){
    console.log(`Test ${testName} finished successfully`);
    if (callback)
        return callback();
    setTimeout(() => {
        process.exit(0);
    }, 1000)
}

const launchTest = function(callback){
    const testRunner = function(callback){
        runTest((err) => {
            if (err){
                console.error(err);
                process.exit(1)
            }
            testFinishCallback(callback);
        });
    }

    const runWithFakeServer = function(callback){
        dc.createTestFolder(testName, async (err, folder) => {
            await tir.launchConfigurableApiHubTestNodeAsync(getBDNSConfig(folder));

            if (!callback)
                assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
            testRunner(callback);
        });
    }

    if (TEST_CONF.fakeServer)
        return runWithFakeServer(callback);

    if (!callback)
        assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
    testRunner(callback);
}

if (!TEST_CONF.useCallback)
    return launchTest();
assert.callback(testName, (testFinished) => {
    launchTest(testFinished);
}, TEST_CONF.timeout)


