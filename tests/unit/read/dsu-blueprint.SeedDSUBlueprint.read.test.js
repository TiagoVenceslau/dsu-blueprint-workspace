
const dsuBlueprint = require('../../../dsu-blueprint/lib');

const {KeySSIType, OpenDSURepository, SeedDSUBlueprint} = dsuBlueprint;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint SEED Update';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const NAME = "Testing", COUNT = 5;

const validateUpdate = function(originalModel, model, callback){
    const err = model.hasErrors();
    if (err)
        return callback(err);
    tr.assert.true(model.name === NAME, "Invalid model Name");
    tr.assert.true(model.count === 2 * COUNT, 'Invalid model count');
    tr.assert.true(model.createdOn instanceof Date, "Invalid type for created On");
    tr.assert.true(model.updatedOn instanceof Date, "Invalid type for updated On");
    tr.assert.true(model.updatedOn > model.createdOn, "Timestamp values for updated on should be greater");

    tr.assert.true(originalModel.createdOn === model.createdOn, "Creation Timestamps do not match");
    tr.assert.true(originalModel.updatedOn < model.updatedOn, "Updated model does not show the updated timestamp");
    callback();
}

const validateCreate = function(model, callback){
    const err = model.hasErrors();
    if (err)
        return callback(err);
    tr.assert.true(model.name === NAME, "Invalid model Name");
    tr.assert.true(model.count === COUNT, 'Invalid model count');
    tr.assert.true(model.createdOn instanceof Date, "Invalid type for created On");
    tr.assert.true(model.updatedOn instanceof Date, "Invalid type for updated On");
    tr.assert.true(model.updatedOn >= model.createdOn, "Timestamp values for updated on should be greater or equal");
    callback();
}


tr.run((callback) => {
    tr.assert.true(dsuBlueprint.getOpenDSU() !== undefined, "OpenDSU cannot be found");

    let seedDSU = new SeedDSUBlueprint();

    let errs = seedDSU.hasErrors();

    tr.assert.true(!!errs, "Model is not validating properly");
    tr.assert.true(Object.keys(errs).length === 3, "Model is not validating properly. Invalid number of errors");

    seedDSU = new SeedDSUModel({
        name: NAME,
        count: COUNT
    })

    errs = seedDSU.hasErrors();

    tr.assert.true(!!errs, "Model is not validating properly");
    tr.assert.true(Object.keys(errs).length === 2, "Model is not validating properly. Invalid number of errors");

    const repo = new OpenDSURepository(SeedDSUBlueprint);
    repo.create(seedDSU, (err, newModel, dsu, keySSI) => {
        if (err)
            return callback(err);

        tr.assert.true(newModel !== undefined, "Updated Model is undefined");
        tr.assert.true(dsu !== undefined, "DSU is undefined");
        tr.assert.true(keySSI !== undefined, "KeySSI is undefined");
        tr.assert.true(keySSI.getTypeName() === KeySSIType.SEED, 'KeySSI is of different type');
        tr.assert.true(keySSI.getDLDomain() === 'default', 'KeySSI is of different domain');

        validateCreate(newModel, (err) => {
            if (err)
                return callback(err);

        });
    });
});