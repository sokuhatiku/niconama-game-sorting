import { Timeline } from "@akashic-extension/akashic-timeline";
import { CharacterManager } from "./characterManager";
import { AssetLoader } from "../assetLoader";

export class GameCore {
    private readonly _scene: g.Scene;
    private readonly _timeline: Timeline;
    private readonly _characterManager: CharacterManager;
    private readonly _root: g.E;
    private readonly _assetLoader: AssetLoader;
    private _active = false;

    private _cooldown = 0;

    /**
     * ゲームを初期化します。
     * 必用なマネージャーを生成し、必用なエンティティをシーンに追加します。
     */
    constructor(params: {
        scene: g.Scene
        timeline: Timeline
    }) {
        this._scene = params.scene;
        this._assetLoader = new AssetLoader(this._scene);
        this._timeline = params.timeline;

        this._root = new g.E({
            scene: this._scene,
            width: g.game.width,
            height: g.game.height,
        });

        this._characterManager = new CharacterManager({
            scene: this._scene,
            parent: this._root,
            timeline: this._timeline,
        });

    }

    /**
     * ゲームのアクティブ状態を切り替えます
     * @param active 新しいアクティブ状態
     */
    public setActive(active: boolean) {
        if(this._active === active) return;
        this._active = active;
        if(active) {
            this.onTurnToActive();
        } else {
            this.onTurnToDeactive();
        }
    }

    private onTurnToActive() {
        this._characterManager.setAllCharactersInteractable(true);
    }

    private onTurnToDeactive() {
        this._characterManager.setAllCharactersInteractable(false);
    }

    // 毎フレーム呼ばれる
    public update() {
        if(!this._active) return;

        if(this._cooldown > 0) {
            this._cooldown--;
            return;
        }
        this._cooldown = g.game.random.generate() * 5;

        const image = this._assetLoader.getImage("/image/male.png");

        this._characterManager.spawnCharacter({
            x: 0,
            y: 0,
            sprite: image,
        });
    }

    public get score(): number {
        return g.game.random.generate() * 100;
    }
}
