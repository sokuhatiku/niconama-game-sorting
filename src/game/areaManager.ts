import { CommonArea } from "@akashic/akashic-engine";
import { Area, createArea } from "./area";

export class AreaManager{
    private readonly _scene: g.Scene;
    private readonly _areas: Area[] = [];

    constructor(params: {
        scene: g.Scene,
    }) {
        this._scene = params.scene;
    }

    public addArea(params: {
        size: CommonArea,
        csscolor: string,
    }): Area{
        const area = createArea({
            scene: this._scene,
            rect: params.size,
            color: params.csscolor,
        });
        this._areas.push(area);
        return area;
    }
}
