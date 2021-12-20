const {Loader, DefaultLoaderConfig} = require('../../trust-loader/lib');

const {OpenDSUTestRunner} = require('../../bin/TestRunner');

let domain = 'vault';
let testName = 'Trust Loader Test';

const defaultOps = {
    timeout: 1000,
    fakeServer: false,
    useCallback: true
}

const env = {
    "appName": "DSU Explorer",
    "appVersion": "0.1.1",
    "vault": "server",
    "agent": "browser",
    "system":   "any",
    "browser":  "any",
    "mode":  "dev-autologin",
    "domain":  "vault",
    "sw": true,
    "pwa": false,
    "legenda for properties": " vault:(server, browser) agent:(mobile,  browser)  system:(iOS, Android, any) browser:(Chrome, Firefox, any) stage:(development, release) sw:(true, false) pwa:(true, false)"
}

const tr = new OpenDSUTestRunner(testName, domain, defaultOps, undefined, '../');

tr.run((callback) => {

    const loader = new Loader(DefaultLoaderConfig, env);

    loader.create([Math.floor(Math.random() * 10000) + ''], (err) => {
        if (err)
            return callback(err);
        callback();
    })
});

