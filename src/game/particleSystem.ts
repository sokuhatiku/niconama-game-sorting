import { Timeline } from "@akashic-extension/akashic-timeline";
import { AssetLoader } from "../assetLoader";

export class ParticleSystem {
    private readonly _scene : g.Scene;
    private readonly _parent : g.E;
    private readonly _timeline : Timeline;

    private readonly _plusSprite : g.ImageAsset;

    public constructor(params: {
        scene: g.Scene
        timeline: Timeline
        parent: g.E
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._parent = params.parent;
        const assetLoader = new AssetLoader(this._scene);

        this._plusSprite = assetLoader.getImage("/image/point.png");
    }

    public spawnPlusParticle(params: {
        x: number
        y: number
    }) {
        const entity = new g.Sprite({
            scene: this._scene,
            src: this._plusSprite,
            x: params.x,
            y: params.y,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._parent
        });

        this._timeline.create(entity).moveY(params.y - 50, 500).call(() => {
            if(entity.destroyed()) return;
            entity.destroy();
        });
    }

}