
const dsuBlueprint = require('../../../dsu-blueprint/lib');
const dsuBlueprintTest = require('../../../dsu-blueprint/lib/tests');


const {KeySSIType, OpenDSURepository} = dsuBlueprint;
const {SeedDSUBlueprint} = dsuBlueprintTest;

const {OpenDSUTestRunner} = require('../../../bin/TestRunner');

let domain = 'default';
let testName = 'DSU Blueprint SEED Update';

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

const NAME = "Testiiiing", COUNT = 5;

const validateUpdate = function(originalModel, model, callback){
    const err = model.hasErrors(originalModel);
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

    seedDSU = new SeedDSUBlueprint({
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

            newModel.name = NAME + NAME;

            repo.update(keySSI, newModel, (err, newModel1, dsu) => {
                tr.assert.true(!!err);

                newModel1 = new SeedDSUBlueprint(newModel);
                newModel1.name = NAME;
                newModel1.count = 2 * COUNT;

                repo.update(keySSI, new SeedDSUBlueprint(newModel1), (err, newModel2, dsu) => {
                    if (err)
                        return callback(err);
                    validateUpdate(newModel1, newModel2, (err) => {
                        if (err)
                            return callback(err)
                        callback();
                    });
                });
            });
        });
    });
});
