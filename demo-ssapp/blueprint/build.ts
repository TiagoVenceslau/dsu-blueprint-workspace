import {DSUBlueprint, DSUModel, addFileFS, dsuFS, addFolderFS} from '@tvenceslau/dsu-blueprint/lib';
import {constructFromObject} from "@tvenceslau/decorator-validation/lib";

@DSUBlueprint(undefined)
export default class BuildDsuBlueprint extends DSUModel{

    @addFileFS("build/init.js", "init.js")
    init?: any = undefined;

    @addFolderFS('code')
    code?: any = undefined;

    @dsuFS("../webcardinal", true)
    webcardinal?: any = undefined;

    @dsuFS("../themes/*", true)
    themes?: any[] = undefined;

    @addFileFS("./build/init.js", "blueprint.js")
    blueprint?: any;

    constructor(blueprint?: BuildDsuBlueprint | {}) {
        super();
        constructFromObject<BuildDsuBlueprint>(this, blueprint);
    }
}