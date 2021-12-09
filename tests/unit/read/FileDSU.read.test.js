
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');
const decValidation = require('../../../dsu-blueprint/node_modules/@tvenceslau/decorator-validation/lib');
const {isEqual} = decValidation;

const {KeySSIType, OpenDSURepository, DsuKeys} = dsuBlueprint;
const {IdDsuBlueprint} = dsuBlueprintTest;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint File contents READ';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const testDSUStructure = function(dsu, originalData, callback){
    dsu.readFile(DsuKeys.DEFAULT_DSU_PATH, (err, data) => {
        if (err)
            return callback(err);
        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        tr.assert.true(isEqual(data, originalData), "Data does not match");
        callback();
    });
}

tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    const data = {
        name: "test",
        id: "test",
        email: "test",
        address: "test"
    }

    let idDSU = new IdDsuBlueprint({
        name: "test",
        id: "test",
        email: "test",
        address: "test"
    });
    let errs = idDSU.hasErrors();

    tr.assert.true(errs !== undefined, "Email was not validated properly");

    data.email = "test@test.com";

    idDSU = new IdDsuBlueprint(data);
    errs = idDSU.hasErrors();

    tr.assert.true(!errs, "Model is not validating properly before create");

    const repo = new OpenDSURepository(IdDsuBlueprint);
    repo.create(idDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);
        const errs = newModel.hasErrors();
        tr.assert.true(!errs, "Model is not validating properly after create");

        repo.read(keySSI, (err, readModel) => {
            if (err || !readModel)
                return callback(err || new Error(`No model`));

            tr.assert.true(readModel instanceof IdDsuBlueprint, "Received Model not of same class")
            tr.assert.true(readModel.equals(newModel), "Model from create does not match model from read");
            callback();
        });
    });
});
