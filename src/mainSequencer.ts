import { GameCore } from "./game/gameCore"

const phases = ["init", "title", "introduction", "ready", "game", "finish", "result"] as const
type PhaseName = (typeof phases)[number]

/**
 * アプリ全体の利用可能時間のうち、何秒目にどのフェーズが始まるかを定義する
 * @param totalTime アプリ全体の利用可能時間
 * @returns 
 */
function defineTimeSchedule(totalTime: number): Map<PhaseName, number> {
    const timeSchedule = new Map<PhaseName, number>()
    timeSchedule.set("title", 0)
    timeSchedule.set("introduction", 5)
    timeSchedule.set("ready", 10)
    timeSchedule.set("game", 15)
    timeSchedule.set("finish", totalTime - 15)
    timeSchedule.set("result", totalTime - 10)
    return timeSchedule
}

/**
 * ニコ生ゲームが始まってから終わるまでのシーケンスを管理するクラス
 */
export class MainSequencer {
    private readonly _totalAvailableTimes: number
    private readonly _gameCore: GameCore

    private readonly _timeSchedule: Map<PhaseName, number> = new Map([])
    private readonly _updatables: { update: () => void }[] = []
    private _currentPhase: PhaseName = phases[0]

    public onPhaseChanged: (phase: PhaseName) => void = () => {}

    constructor(params: {
        totalAvailableTimes: number
        gameCore: GameCore
    }) {
        this._totalAvailableTimes = params.totalAvailableTimes
        this._gameCore = params.gameCore
        this._updatables.push(this._gameCore)

        this._timeSchedule = defineTimeSchedule(params.totalAvailableTimes)
    }

    private calcIdealPhase(time: number): PhaseName {
        let currentPhase: PhaseName = phases[0]
        for(const [phase, startAt] of this._timeSchedule) {
            if(time >= startAt) {
                currentPhase = phase
            }
        }
        return currentPhase
    }

    public update(): void {
        const elapsedSeconds = g.game.age / g.game.fps
        const idealPhase = this.calcIdealPhase(elapsedSeconds)
        if(this._currentPhase !== idealPhase) {
            this._currentPhase = idealPhase
            this.changePhase(idealPhase)
        }

        this._updatables.forEach(updatable => {
            updatable.update()
        })
    }

    /**
     * 次のフェーズの為に必要な処理を行う
     * 一旦フェーズはシーケンシャルに進むように実装するので、飛び飛びで呼ばれることを考慮しない
     * @param phase 
     */
    private changePhase(phase: PhaseName): void {
        switch(phase) {
            case "title":
                break
            case "introduction":
                break
            case "ready":
                break
            case "game":
                this._gameCore.setActive(true)
                break
            case "finish":
                this._gameCore.setActive(false)
                break
            case "result":
                break
        }

        this.onPhaseChanged?.(phase)
    }

    public get progress(): number {
        const elapsedSeconds = g.game.age / g.game.fps
        return elapsedSeconds / this._totalAvailableTimes
    }
}


