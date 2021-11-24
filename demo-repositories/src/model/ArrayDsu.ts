// @ts-ignore
import {DSU, DSUModel} from "../../../dsu-blueprint/src";
import {constructFromObject, DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib";
import {KeySSIType} from "../../../dsu-blueprint/src/opendsu/types";

@DSU("default", KeySSIType.ARRAY, true, "name", "createdOn")
export class ArrayDSUModel extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    name?: string = undefined;

    @timestamp(DBOperations.CREATE)
    createdOn?: Date = undefined;

    @timestamp()
    updatedOn?: Date = undefined;

    constructor(arrayDSUModel: ArrayDSUModel | {}){
        super();
        constructFromObject(this, arrayDSUModel);
    }
}