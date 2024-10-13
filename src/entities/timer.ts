export interface TimerParameterObject {
    name?: string
    scene: g.Scene
    parent?: g.Scene | g.E
    font?: g.Font
}

export interface Timer {
    get entity(): g.E

    set(timeSeconds: number): void
    start(): void
    stop(): void

    onTimeUp?: () => void
}

export function createTimer(param: TimerParameterObject): Timer {
    return new TimerImpl(param);
}

class TimerImpl implements Timer {
    public onTimeUp?: () => void;

    private _entity: g.Label;
    private _seconds = 0;
    private _isRunning = false;

    public get entity(): g.E {
        return this._entity;
    }

    public constructor(param: TimerParameterObject) {
        const font = param.font ?? new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 48,
        });

        const label = new g.Label({
            scene: param.scene,
            font: font,
            text: "0",
            x: 0,
            y: 0,
            width: g.game.width,
            height: 48,
        });

        label.aligning(g.game.width, "left");
        label.modified();

        label.onUpdate.add(() => {
            if (!this._isRunning) {
                return;
            }

            this._seconds -= 1 / g.game.fps;
            if (this._seconds <= 0) {
                this._isRunning = false;
                this._seconds = 0;
                this.onTimeUp?.();
            }

            this.updateLabel();
        }, this);

        const parent = param.parent ?? param.scene;
        parent.append(label);

        this._entity = label;
    }

    public set(timeSeconds: number): void {
        this._seconds = timeSeconds;
        this.updateLabel();
    }

    public start(): void {
        this._isRunning = true;
    }

    public stop(): void {
        this._isRunning = false;
    }

    private updateLabel(): void {
        const seconds = Math.ceil(this._seconds);
        const currentText = this._entity.text;
        const newText = `${String(seconds)}秒`;
        if (currentText === newText) {
            return;
        }
        this._entity.text = newText;
        this._entity.textColor = seconds <= 10 ? "red" : "black";
        this._entity.invalidate();
    }
}
