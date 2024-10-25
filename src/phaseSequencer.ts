import { Phase } from "./phase";

/**
 * ニコ生ゲームが始まってから終わるまでのシーケンスを管理するクラス
 */
export class PhaseSequencer {
    private readonly _totalSeconds: number;

    private readonly _phases: { phase: Phase, dulation: number }[] = [];

    private _currentPhaseIndex = -1;

    
    private _totalProgress = 0;
    private _currentPhaseProgress = 0;

    public get totalProgress(): number {
        return this._totalProgress;
    }

    public get currentPhaseProgress(): number {
        return this._currentPhaseProgress;
    }

    private readonly _phaseChangedTrigger: g.Trigger<string> = new g.Trigger<string>();
    public get onPhaseChanged(): g.Trigger<string>
    {
         return this._phaseChangedTrigger;
    }

    public constructor(params: {
        timeLimitSeconds: number,
        phases: { phase: Phase, dulation: number }[],
    }) {
        this._phases = params.phases;

        let aggregatedSeconds = 0;
        for( const phase of this._phases) {
            aggregatedSeconds += phase.dulation;
        }
        if(aggregatedSeconds > params.timeLimitSeconds) {
            throw new Error(`The sum of the duration of the phases(${aggregatedSeconds.toString()}) exceeds the total duration(${params.timeLimitSeconds.toString()}).`);
        }

        this._totalSeconds = aggregatedSeconds;
    }

    private calcCurrentPhaseIndex(elapsedSeconds: number): number {
        let aggregated = 0;
        for (let i = 0; i < this._phases.length; i++) {
            const phase = this._phases[i];
            aggregated += phase.dulation;
            if (aggregated > elapsedSeconds) {
                return i;
            }
        }
        return this._phases.length-1;
    }

    public update(): void {
        const totalElapsedSeconds = g.game.age / g.game.fps;
        const totalProgress = totalElapsedSeconds / this._totalSeconds;
        const currentPhaseIndex = this.calcCurrentPhaseIndex(totalElapsedSeconds);
        if(currentPhaseIndex != this._currentPhaseIndex) {
            this.changePhase(currentPhaseIndex);
        }

        const currentPhase = this._phases[this._currentPhaseIndex];
        const currentElapsedFrames =  g.game.age - this._phases.slice(0, this._currentPhaseIndex).reduce((acc, phase) => acc + phase.dulation * g.game.fps, 0);
        const currentElapsedSeconds = currentElapsedFrames / g.game.fps;
        const currentProgress = currentElapsedSeconds / currentPhase.dulation;

        this._totalProgress = totalProgress;
        this._currentPhaseProgress = currentProgress;

        currentPhase.phase.update({
            elapsedSeconds: currentElapsedSeconds,
            elapsedFrames: currentElapsedFrames,
            progress: currentProgress
        });

    }

    private changePhase(phaseIndex:number): void {
        if(this._currentPhaseIndex >= 0) {
            const oldPhase = this._phases[this._currentPhaseIndex];
            oldPhase.phase.exit();
        }

        this._currentPhaseIndex = phaseIndex;
        const newPhase = this._phases[phaseIndex];

        newPhase.phase.enter({ 
            reservedSeconds: newPhase.dulation,
            reservedFrames: newPhase.dulation * g.game.fps
        });

        this._phaseChangedTrigger.fire(newPhase.phase.name);
    }

}


