import { Timeline } from "@akashic-extension/akashic-timeline";
import { CharacterManager } from "./characterManager";
import { AssetLoader } from "../assetLoader";
import { createArea, Area } from "./area";
import { CharacterProfile } from "./character";
import { Scoreboard } from "./scoreboard";

export class GameCore {
    private readonly _scene: g.Scene;
    private readonly _assetLoader: AssetLoader;
    private readonly _timeline: Timeline;
    private readonly _characterManager: CharacterManager;
    private readonly _scoreboard: Scoreboard;
    private readonly _root: g.E;
    private readonly _scoreUpdatedTrigger: g.Trigger<number> = new g.Trigger<number>();

    private readonly _updateTrigger: g.Trigger = new g.Trigger();

    private readonly _characterProfiles: {
        male: CharacterProfile,
        female: CharacterProfile,
    };

    private readonly _areas: {
        left: Area,
        right: Area,
        center: Area,
    };

    private _active = false;

    private _cooldown = 0;

    public get onScoreUpdated(): g.Trigger<number> {
        return this._scoreUpdatedTrigger;
    }

    /**
     * ゲームを初期化します。
     * 必用なマネージャーを生成し、必用なエンティティをシーンに追加します。
     */
    public constructor(params: {
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
            parent: this._scene,
        });

        const areaRoot = new g.E({
            scene: this._scene,
            width: g.game.width,
            height: g.game.height,
            parent: this._root,
        });

        this._areas = {
            left: createArea({
                id: "left",
                scene: this._scene,
                rect:  { x: 38, y: 128, width: 301, height: 544 },
                color: "rgba(200, 100, 100, 1)",
                parent: areaRoot,
                updateTrigger: this._updateTrigger,
            }),
            right: createArea({
                id: "right",
                scene: this._scene,
                rect: { x: 941, y: 128, width: 301, height: 544 },
                color: "rgba(100, 100, 200, 1)",
                parent: areaRoot,
                updateTrigger: this._updateTrigger,
            }),
            center: createArea({
                id: "center",
                scene: this._scene,
                rect: { x: 339, y: 128, width: 602, height: 544 },
                color: "rgba(200, 200, 200, 1)",
                parent: areaRoot,
                updateTrigger: this._updateTrigger,
            }),
        };

        this._characterProfiles = {
            male : {
                sprite: this._assetLoader.getImage("/image/male.png"),
                goalAreaId: "left",
            },
            female: {
                sprite: this._assetLoader.getImage("/image/female.png"),
                goalAreaId: "right",
            }
        };

        this._characterManager = new CharacterManager({
            scene: this._scene,
            parent: this._root,
            timeline: this._timeline,
            areas: [this._areas.center, this._areas.left, this._areas.right],
        });

        this._scoreboard = new Scoreboard({
            scene: this._scene,
            parent: this._root,
        });
        this._scoreboard.onScoreUpdated.add((score) => {
            this._scoreUpdatedTrigger.fire(score);
        });

        this._characterManager.onCharacterPlaced.add((ev) => {
            const effective = ev.isCorrectArea && ev.area.active;
            console.log("onCharacterPlaced", effective);
            
            if(effective){
                this._scoreboard.addCorrectPoint();
            } else {
                this._scoreboard.addIncorrectPoint();
            }

            if(!ev.area.active) {
                // エリアが非活性であればその場でキャラを削除
                this._characterManager.destroyCharacter(ev.character);
            }
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

        this._updateTrigger.fire();

        if(this._cooldown > 0) {
            this._cooldown--;
            return;
        }
        this._cooldown = g.game.random.generate() * 5;

        const isMale = g.game.random.generate() > 0.5;

        this._characterManager.spawnCharacter({
            x: 0,
            y: 0,
            profile: isMale ? this._characterProfiles.male : this._characterProfiles.female,
        });

        // 左右にいるエリアの判定実施
        for(const area of [this._areas.left, this._areas.right]) {
            if(area.characters.length < 10) continue;
            // 10匹を超えている場合は全員削除する
            const charactersToDestroy = area.characters.slice();
            charactersToDestroy.forEach((c) => {
                area.removeCharacter(c);
                this._characterManager.destroyCharacter(c);
            });
            // 出荷ボーナスをスコアに加算
            this._scoreboard.addSippingPoint();

            // 5秒間はエリアを非活性化
            area.setInnatcive(5);
        }
    }

    public get score(): number {
        return g.game.random.generate() * 100;
    }
}
