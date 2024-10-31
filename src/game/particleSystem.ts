import { Timeline, Easing } from "@akashic-extension/akashic-timeline";
import { AssetLoader } from "../assetLoader";

export class ParticleSystem {
    private readonly _scene : g.Scene;
    private readonly _parent : g.E;
    private readonly _timeline : Timeline;

	private readonly _sprites: {
		ok: g.ImageAsset;
		ng: g.ImageAsset;
	};

    public constructor(params: {
        scene: g.Scene
        timeline: Timeline
        parent: g.E
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._parent = params.parent;
        const assetLoader = new AssetLoader(this._scene);

		this._sprites = {
			ok: assetLoader.getImage("/image/checkmark.png"),
			ng: assetLoader.getImage("/image/crossmark.png"),
		};
    }

    public spawnOKParticle(params: {
        x: number
        y: number
    }) {
        const entity = new g.Sprite({
            scene: this._scene,
            src: this._sprites.ok,
            x: params.x,
            y: params.y,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._parent,
			scaleX: 2,
			scaleY: 2,
			touchable: false,
        });

        this._timeline.create(entity)
			.moveY(params.y - 50, 500, Easing.easeOutQuint)
			.call(() => {
				if(entity.destroyed()) return;
				entity.destroy();
			});
    }

	public spawnNGParticle(params: {
		x: number
		y: number
	}) {
		const entity = new g.Sprite({
			scene: this._scene,
			src: this._sprites.ng,
			x: params.x,
			y: params.y,
			anchorX: 0.5,
			anchorY: 0.5,
			parent: this._parent,
			scaleX: 2,
			scaleY: 2,
			touchable: false,
		});

		this._timeline.create(entity)
			.every((e, p) => {
				entity.y = params.y - (50 * p);
				entity.x = params.x + Math.sin(e * Math.PI * 2) * 10;
			 }, 500, Easing.easeOutQuint)
			.call(() => {
				if(entity.destroyed()) return;
				entity.destroy();
			});
	}
}
