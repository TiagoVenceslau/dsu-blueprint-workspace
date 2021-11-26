//process.exit(0) // ignore the template in tests....
const path = require('path');

const defaultPathAdaptor = path.join('..',path.sep, '..');

const argParser = function(defaultOpts, args){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

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

const getBDNSConfig = function(name, domains){
    if (!domains)
        domains = [{
            name: name,
            config: DOMAIN_CONFIG
        }];
    return {
        maxTries: 10,
        domains: domains.map((d, i) =>
            ({
                name: name[i],
                config: DOMAIN_CONFIG,
            })
        ),
    }
}

const defaultOps = {
    timeout: 1000,
    fakeServer: true,
    useCallback: true
}

class OpenDSUTestRunner {
    name;
    options;
    bdnsConfig;

    dc;
    assert;
    tir;

    constructor(name, domain, defaultOptions, bdnsConfig, pathAdaptor){
        process.env.NO_LOGS = true;
        process.env.PSK_CONFIG_LOCATION = process.cwd();

        this.name = name;
        this.options = argParser(Object.assign({}, defaultOps, defaultOptions), process.argv);
        this.bdnsConfig = bdnsConfig || getBDNSConfig(domain || "default");

        const test_bundles_path = path.join(pathAdaptor, 'privatesky/psknode/bundles', 'testsRuntime.js');
        require(test_bundles_path);
        this.dc = require("double-check");
        this.assert = this.dc.assert;
        this.tir = require(path.join(pathAdaptor, "privatesky/psknode/tests/util/tir"));
    }

    run(test){
        const self = this;

        const testFinishCallback = function(callback){
            console.log(`Test ${self.name} finished successfully`);
            if (callback)
                return callback();
            setTimeout(() => {
                process.exit(0);
            }, 1000)
        }

        const launchTest = function(callback){
            const testRunner = function(callback){
                test((err) => {
                    if (err){
                        console.error(err);
                        process.exit(1)
                    }
                    testFinishCallback(callback);
                });
            }

            const runWithFakeServer = function(callback){
                self.dc.createTestFolder(self.name.split(' ').join('-'), async (err, folder) => {
                    await self.tir.launchConfigurableApiHubTestNodeAsync(Object.assign({}, self.bdnsConfig, {
                        storageFolder: folder
                    }));

                    if (!callback)
                        self.assert.begin(`Running test ${self.name}`, undefined, self.options.timeout);
                    testRunner(callback);
                });
            }

            if (self.options.fakeServer)
                return runWithFakeServer(callback);

            if (!callback)
                self.assert.begin(`Running test ${testName}`, undefined, self.options.timeout);
            testRunner(callback);
        }

        if (!self.options.useCallback)
            return launchTest();
        self.assert.callback(self.name, (testFinished) => {
            launchTest(testFinished);
        }, self.options.timeout)


    }
}

module.exports = {
    OpenDSUTestRunner,
    defaultOps,
    defaultPathAdaptor,
    argParser,
    getBDNSConfig,
    DOMAIN_CONFIG
}