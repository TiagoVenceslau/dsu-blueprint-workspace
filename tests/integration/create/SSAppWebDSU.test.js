const dsuBlueprint = require('../../../dsu-blueprint/lib');
const decValidation = require('../../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');

const {KeySSIType, OpenDSURepository, getKeySSIApi, getResolverApi} = dsuBlueprint;
const {SSAppWebDsuBlueprint} = dsuBlueprintTest;
const {isEqual} = decValidation;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'SSApp Web DSU Blueprint';

const defaultOps = {
    timeout: 1000000,
    fakeServer: false,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testId = function(id, dsu, callback){
    dsu.readFile("id/info.json", (err, data) => {
        if (err)
            return callback(err);
        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        tr.assert.true(isEqual(id, data), "File contents are wrong");

        dsu.getSSIForMount('/id', (err, idSSI) => {
            if (err || !idSSI)
                return callback(err || "Missing Id KeySSI");

            try {
                idSSI = getKeySSIApi().parse(idSSI);
            } catch (e) {
                return callback(e);
            }

            tr.assert.true(idSSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
            tr.assert.true(idSSI.getDLDomain() === 'default', 'KeySSI is of different domain');

            callback();
        });
    });
}

const testParticipant = function(id, dsu, callback){
    dsu.readFile('participant/id/info.json', (err, pData) => {
        if (err)
            return callback(err);
        try {
            pData = JSON.parse(pData);
        } catch (e) {
            return callback(e);
        }
        tr.assert.true(isEqual(id, pData), "Participant File contents are wrong");

        dsu.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return callback(err)
            dsu.getSSIForMount('/participant', (err, participantSSI) => {
                if (err || !participantSSI)
                    return callback(err || "Missing KeySSI");

                try {
                    participantSSI = getKeySSIApi().parse(participantSSI);
                } catch (e) {
                    return callback(e);
                }

                const ssi = getKeySSIApi().createArraySSI(domain, [id.id, id.name, id.address, id.email]);

                tr.assert.true(ssi.getIdentifier() === participantSSI.getIdentifier(), "Participant DSU SSI does not match");

                getResolverApi().loadDSU(ssi, (err, participantDSU) => {
                    if (err || !participantDSU)
                        return callback(err || "Missing participant DSU");
                    participantDSU.getSSIForMount('/id', (err, idSSI) => {
                        if (err || !idSSI)
                            return callback(err || "Missing Id SSI");

                        try {
                            idSSI = getKeySSIApi().parse(idSSI);
                        } catch (e) {
                            return callback(e);
                        }
                        tr.assert.true(idSSI.getTypeName() === KeySSIType.sREAD, 'KeySSI is of different type');
                        tr.assert.true(idSSI.getDLDomain() === 'default', 'KeySSI is of different domain');
                        callback();
                    });
                });
            });
        });
    });
}

const testDb = function(id, dsu, callback){
    dsu.listMountedDSUs('/data', (err, mounts) => {
        if (err)
            return callback(err);
        dsu.getSSIForMount('/db', (err, dbSSI) => {
            if (err || ! dbSSI)
                return callback(err || "Missing data DSU");

            try{
                dbSSI = getKeySSIApi().parse(dbSSI);
            } catch (e) {
                return callback(e)
            }

            tr.assert.true(dbSSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
            tr.assert.true(dbSSI.getDLDomain() === 'default', 'KeySSI is of different domain');

            getResolverApi().loadDSU(dbSSI, (err, dbDSU) => {
                if (err || !dbDSU)
                    return callback(err || "Missing data DSU");

                dbDSU.getSSIForMount('/data', (err, dataSSI) => {
                    if (err || !dataSSI)
                        return callback(err || "Missing data SSI");

                    try {
                        dataSSI = getKeySSIApi().parse(dataSSI);
                    } catch (e) {
                        return callback(e);
                    }
                    tr.assert.true(dataSSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
                    tr.assert.true(dataSSI.getDLDomain() === 'default', 'KeySSI is of different domain');
                    callback();
                });
            });

        });
    });
}

const testCode = function(id, dsu, callback) {
    dsu.getSSIForMount('/code', (err, codeSSI) => {
        if (err || !codeSSI)
            return callback(err || "Missing Code DSU");

        try{
            codeSSI = getKeySSIApi().parse(codeSSI);
        } catch (e) {
            return callback(e)
        }

        tr.assert.true(codeSSI.getTypeName() === KeySSIType.sREAD, 'KeySSI is of different type');
        tr.assert.true(codeSSI.getDLDomain() === 'default', 'KeySSI is of different domain');

        callback();
    });
}

const testDSUStructure = function(id, dsu, callback){
    testId(id, dsu, (err) => {
        if (err)
            return callback(err);
        testParticipant(id, dsu, err => {
            if (err)
                return callback(err);
            testDb(id, dsu, err => err
                ? callback(err)
                : testCode(id, dsu, callback));
        });
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const id = {
        id: "testID" + Math.floor(Math.random() * 10000),
        name: "testName",
        email: "test@test.com",
        address: "test address"
    }

    let ssAppDSU = new SSAppWebDsuBlueprint({
        id: id
    });

    let errs = ssAppDSU.hasErrors();

    tr.assert.true(errs === undefined, "BuildDSU shows errors");
    const repo = new OpenDSURepository(SSAppWebDsuBlueprint, "default", '../../../dsu-blueprint');
    repo.create(ssAppDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');
        testDSUStructure(id, dsu, callback);
    });
});
