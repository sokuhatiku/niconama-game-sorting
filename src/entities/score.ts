export type ScoreParameterObject = {
    name?: string
    scene: g.Scene
    parent?: g.Scene | g.E
    font?: g.Font
}

export interface Score {
    get entity(): g.E

    set(point: number): void
}

export function createScore(param: ScoreParameterObject): Score {
    return new ScoreImpl(param)
}

class ScoreImpl implements Score {

    private _entity: g.Label

    get entity(): g.E {
        return this._entity
    }

    constructor(param: ScoreParameterObject) {
        const font = param.font ?? new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 48,
        })

        const label = new g.Label({
            scene: param.scene,
            font: font,
            text: "0",
            x: 0,
            y: 0,
            width: g.game.width,
            height: 48,
        })

        label.aligning(g.game.width, "right")
        label.invalidate()

        const parent = param.parent ?? param.scene
        parent.append(label)

        this._entity = label
    }

    set(point: number): void {
        const newText = `${point}`
        if (this._entity.text === newText) {
            return
        }
        this._entity.text = newText
        this._entity.invalidate()
    }
}
