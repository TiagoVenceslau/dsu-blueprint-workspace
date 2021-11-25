// @ts-ignore
import {DSUModel, DSUModel} from "../../../dsu-blueprint/src";
import {constructFromObject, DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib";

@DSUModel("default")
export class SeedDSUModel extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    name?: string = undefined;

    @timestamp(DBOperations.CREATE)
    createdOn?: Date = undefined;

    @timestamp()
    updatedOn?: Date = undefined;

    constructor(seedDSuModel: SeedDSUModel | {}){
        super();
        constructFromObject(this, seedDSuModel);
    }
}