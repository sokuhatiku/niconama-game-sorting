import { Description } from "./description";
import { GameCore } from "./game/gameCore";
import { Title } from "./title";

const phases = ["init", "title", "introduction", "ready", "game", "finish", "result"] as const;
type PhaseName = (typeof phases)[number]

/**
 * アプリ全体の利用可能時間のうち、何秒目にどのフェーズが始まるかを定義する
 * @param totalTime アプリ全体の利用可能時間
 * @returns 
 */
function defineTimeSchedule(totalTime: number): Map<PhaseName, number> {
    const timeSchedule = new Map<PhaseName, number>();
    timeSchedule.set("title", 0);
    timeSchedule.set("introduction", 3);
    timeSchedule.set("ready", 10);
    timeSchedule.set("game", 13);
    timeSchedule.set("finish", totalTime - 15);
    timeSchedule.set("result", totalTime - 10);
    return timeSchedule;
}

/**
 * ニコ生ゲームが始まってから終わるまでのシーケンスを管理するクラス
 */
export class MainSequencer {
    private readonly _totalAvailableTimes: number;
    private readonly _gameCore: GameCore;
    private readonly _title: Title;
    private readonly _description: Description;

    private readonly _timeSchedule = new Map<PhaseName, number>([]);
    private readonly _updatables: { update: () => void }[] = [];
    private _currentPhase: PhaseName = phases[0];

    private readonly _phaseChangedTrigger: g.Trigger<PhaseName> = new g.Trigger<PhaseName>();
    public get onPhaseChanged(): g.Trigger<PhaseName>
    {
         return this._phaseChangedTrigger;
    }

    public constructor(params: {
        totalAvailableTimes: number
        gameCore: GameCore
        title: Title
        description: Description
    }) {
        this._totalAvailableTimes = params.totalAvailableTimes;
        this._gameCore = params.gameCore;
        this._updatables.push(this._gameCore);

        this._title = params.title;
        this._description = params.description;

        this._timeSchedule = defineTimeSchedule(params.totalAvailableTimes);
    }

    private calcIdealPhase(time: number): PhaseName {
        let currentPhase: PhaseName = phases[0];
        for(const [phase, startAt] of this._timeSchedule) {
            if(time >= startAt) {
                currentPhase = phase;
            }
        }
        return currentPhase;
    }

    public update(): void {
        const elapsedSeconds = g.game.age / g.game.fps;
        const idealPhase = this.calcIdealPhase(elapsedSeconds);
        if(this._currentPhase !== idealPhase) {
            this._currentPhase = idealPhase;
            this.changePhase(idealPhase);
        }

        this._updatables.forEach(updatable => {
            updatable.update();
        });
    }

    /**
     * 次のフェーズの為に必要な処理を行う
     * 一旦フェーズはシーケンシャルに進むように実装するので、飛び飛びで呼ばれることを考慮しない
     * @param phase 
     */
    private changePhase(phase: PhaseName): void {
        switch(phase) {
            case "title":
                this._title.show();
                break;
            case "introduction":
                this._title.hide();
                this._description.show();
                break;
            case "ready":
                this._description.hide();
                break;
            case "game":
                this._gameCore.setActive(true);
                break;
            case "finish":
                this._gameCore.setActive(false);
                break;
            case "result":
                break;
        }

        this._phaseChangedTrigger.fire(phase);
    }

    public get progress(): number {
        const elapsedSeconds = g.game.age / g.game.fps;
        return elapsedSeconds / this._totalAvailableTimes;
    }
}


