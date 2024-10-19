import { Timeline } from "@akashic-extension/akashic-timeline";
import { CharacterManager } from "./characterManager";
import { AssetLoader } from "../assetLoader";
import { Area } from "./area";
import { CharacterProfile } from "./character";
import { Scoreboard } from "./scoreboard";
import { RectNavigator } from "./rectNavigator";
import { PolygonNavigator } from "./polygonNavigator";

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
            center: createMainArea({
                scene: this._scene,
                updateTrigger: this._updateTrigger,
                areaRoot
            }),
            left: createGoalArea({
                scene: this._scene,
                updateTrigger: this._updateTrigger,
                id: "left",
                area: { x: 320, y: 272, width: 176, height: 256 },
                cssColor: "rgba(200, 100, 100, 1)",
                areaRoot
            }),
            right: createGoalArea({
                scene: this._scene,
                updateTrigger: this._updateTrigger,
                id: "right",
                area: { x: 784, y: 272, width: 176, height: 256 },
                cssColor: "rgba(100, 100, 200, 1)",
                areaRoot
            }),
        };

        this._characterProfiles = {
            male : {
                sprite: this._assetLoader.getImage("/image/male.png"),
                grabSizeOffset: { top: 2, left: 0, right: -6, bottom: 2 },
                goalAreaId: this._areas.left.id,
            },
            female: {
                sprite: this._assetLoader.getImage("/image/female.png"),
                grabSizeOffset: { top: 2, left: 0, right: -6, bottom: 2 },
                goalAreaId: this._areas.right.id,
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
     * 非アクティブ状態ではキャラクターのスポーンや操作判定が行われません
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

        const spawnPoint: g.CommonOffset = g.game.random.generate() > 0.5 ? {x:g.game.width/2, y:0} : {x:g.game.width/2, y:g.game.height};
        this._characterManager.spawnCharacter({
            position: spawnPoint,
            profile: isMale ? this._characterProfiles.male : this._characterProfiles.female,
        });

        // 左右にいるエリアの判定実施
        for(const area of [this._areas.left, this._areas.right]) {
            if(area.characters.length < 10) continue;
            // 10匹を超えている場合は出荷処理を実施
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

function createMainArea(params: {
    scene: g.Scene,
    updateTrigger: g.Trigger,
    areaRoot: g.E
}): Area {
    // ゴールエリアを避けるようにポリゴンナビゲーターを作成
    const navigator = new PolygonNavigator([
        { x: 320, y: 176 },
        { x: 320, y: 272 },
        { x: 496, y: 272 },
        { x: 496, y: 528 },
        { x: 320, y: 528 },
        { x: 320, y: 624 },
        { x: 960, y: 624 },
        { x: 960, y: 528 },
        { x: 784, y: 528 },
        { x: 784, y: 272 },
        { x: 960, y: 272 },
        { x: 960, y: 176 },
    ], { x: 496, y: 176, width: 288, height: 448 });
    const area = new Area({
        id: "center",
        scene: params.scene,
        navigator: navigator,
        parent: params.areaRoot,
        updateTrigger: params.updateTrigger,
    });
    new g.FilledRect({
        scene: params.scene,
        x: 320,
        y: 176,
        width: 640,
        height: 448,
        cssColor: "rgba(200, 200, 200, 1)",
        parent: area.entity,
    });
    return area;
}

function createGoalArea(params: {
    scene: g.Scene,
    id: string,
    area: g.CommonArea,
    cssColor: string,
    areaRoot: g.E,
    updateTrigger: g.Trigger,
}): Area {
    const areaObj = new Area({
        id: params.id,
        scene: params.scene,
        navigator: new RectNavigator(params.area),
        parent: params.areaRoot,
        updateTrigger: params.updateTrigger,
    });
    areaObj.entity.moveTo(params.area.x, params.area.y);
    areaObj.entity.modified();
    
    const visual = new g.FilledRect({
        scene: params.scene,
        x: 0,
        y: 0,
        width: params.area.width,
        height: params.area.height,
        cssColor: params.cssColor,
        parent: areaObj.entity,
    });

    areaObj.onActiveChanged.add((active) => {
        visual.cssColor = active ? params.cssColor : "black";
    });

    return areaObj;
}