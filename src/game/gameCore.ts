import { Timeline } from "@akashic-extension/akashic-timeline"
import { CharacterManager } from "./characterManager"

export class GameCore {
    private readonly _scene: g.Scene
    private readonly _timeline: Timeline
    private readonly _characterManager: CharacterManager
    private readonly _root: g.E
    private _active: boolean = false

    /**
     * ゲームを初期化します。
     * 必用なマネージャーを生成し、必用なエンティティをシーンに追加します。
     */
    constructor(params: {
        scene: g.Scene
        timeline: Timeline
    }) {
        this._scene = params.scene
        this._timeline = params.timeline

        this._root = new g.E({
            scene: this._scene,
            width: g.game.width,
            height: g.game.height,
        })

        this._characterManager = new CharacterManager({
            scene: this._scene,
            parent: this._root,
            timeline: this._timeline,
        })

    }

    /**
     * ゲームのアクティブ状態を切り替えます
     * @param active 新しいアクティブ状態
     */
    public setActive(active: boolean): void {
        if(this._active === active) return
        this._active = active
        if(active) {
            this.onTurnToActive()
        } else {
            this.onTurnToDeactive()
        }
    }

    private onTurnToActive(): void {

    }

    private onTurnToDeactive(): void {

    }

    // 毎フレーム呼ばれる
    public update(): void {

    }

    public get score(): number {
        return 0
    }
}
