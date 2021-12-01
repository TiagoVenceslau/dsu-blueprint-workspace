import {constructFromObject} from "@tvenceslau/db-decorators/lib";
import {DSUBlueprint, DSUModel, addFileFS, dsuFS, addFolderFS} from '@tvenceslau/dsu-blueprint/lib';

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

    constructor(blueprint?: BuildDsuBlueprint | {}) {
        super();
        constructFromObject<BuildDsuBlueprint>(this, blueprint);
    }
}