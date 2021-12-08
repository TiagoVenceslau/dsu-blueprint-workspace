import {constructFromObject, DBOperations, onUpdate, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib";
import {KeySSIType, DSUModel, DSUBlueprint} from "@tvenceslau/dsu-blueprint/lib";

@DSUBlueprint(undefined, KeySSIType.ARRAY, undefined, undefined, true, "createdOn")
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