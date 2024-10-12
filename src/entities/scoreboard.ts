export class Scoreboard {
    private _entity: g.E

    private _correctCountLabel: g.Label
    private _qualityPointLabel: g.Label
    private _scoreLabel: g.Label

    private _correctCount: number = 0
    private _incorrectCount: number = 0
    private _score: number = 0

    private _scoreUpdatedHandler?: (score: number) => void

    get entity(): g.E {
        return this._entity
    }

    constructor(param: {
        scene: g.Scene
        parent?: g.Scene | g.E
        font?: g.Font
        scoreCallback?: (score: number) => void
    }) {
        this._scoreUpdatedHandler = param.scoreCallback

        const root = new g.E({
            scene: param.scene,
            x: 0,
            y: 0,
            width: g.game.width,
            height: g.game.height,
        })
        this._entity = root
        const parent = param.parent ?? param.scene
        parent.append(root)

        const font = param.font ?? new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 48,
        })

        const correctPointLabel = new g.Label({
            scene: param.scene,
            font: font,
            text: "0",
            x: 0,
            y: 0,
            width: g.game.width,
            height: 48,
        })
        correctPointLabel.aligning(g.game.width, "right")
        correctPointLabel.invalidate()
        root.append(correctPointLabel)
        this._correctCountLabel = correctPointLabel

        const incorrectPointLabel = new g.Label({
            scene: param.scene,
            font: font,
            text: "0",
            x: 0,
            y: 48,
            width: g.game.width,
            height: 48,
        })
        incorrectPointLabel.aligning(g.game.width, "right")
        incorrectPointLabel.invalidate()
        root.append(incorrectPointLabel)
        this._qualityPointLabel = incorrectPointLabel

        const scoreLabel = new g.Label({
            scene: param.scene,
            font: font,
            text: "0",
            x: 0,
            y: 96,
            width: g.game.width,
            height: 48,
        })
        scoreLabel.aligning(g.game.width, "right")
        scoreLabel.invalidate()
        root.append(scoreLabel)
        this._scoreLabel = scoreLabel

        this.updateScore()
    }

    get score(): number {
        return this._score
    }

    addCorrectPoint(): void {
        this._correctCount++
        this.updateScore()
    }

    addIncorrectPoint(): void {
        this._incorrectCount++
        this.updateScore()
    }

    private updateScore(): void {
        const baseScore = this._correctCount * 100
        const qualityScore = this._correctCount === 0 ? 100
            : Math.max(this._correctCount - this._incorrectCount, 0) / this._correctCount * 100
        const totalScore = Math.floor(baseScore * (qualityScore / 100))

        if (this._score !== totalScore){
            this._score = totalScore
            this._scoreUpdatedHandler?.(this._score)
        }

        const correctText = `納品:${this._correctCount}`
        const qualityText = `品質:${qualityScore.toFixed(2)}%`
        const scoreText = `スコア:${this._score}`

        if (this._correctCountLabel.text !== correctText) {
            this._correctCountLabel.text = correctText
            this._correctCountLabel.invalidate()
        }
        if (this._qualityPointLabel.text !== qualityText) {
            this._qualityPointLabel.text = qualityText
            this._qualityPointLabel.invalidate()
        }
        if (this._scoreLabel.text !== scoreText) {
            this._scoreLabel.text = scoreText
            this._scoreLabel.invalidate()
        }
    }

}
