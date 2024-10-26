import { Phase } from "./phase";

export class ResultPhase implements Phase {
    private _background: g.FilledRect;
    private _scoreLabel: g.Label;
    private _score = 0;

    public constructor(params: {
        scene: g.Scene
        scoreLayer: g.E
        font: g.Font
    }){
        const background = new g.FilledRect({
            scene: params.scene,
            cssColor: "rgba(255, 255, 255, 0.5)",
            x: g.game.width * 0.1,
            y: g.game.height * 0.1,
            width: g.game.width * 0.8,
            height: g.game.height * 0.8,
            parent: params.scoreLayer,
        });
        this._background = background;

        const scoreLabel = new g.Label({
            scene: params.scene,
            text: "スコア: 0",
            font: params.font,
            fontSize: 60,
            x: background.width / 2,
            y: background.height / 2,
            textAlign: "center",
            width: g.game.width,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: background,
        });
        this._scoreLabel = scoreLabel;

        background.hide();

    }

    public enter(): void {
        this._background.show();
    }
    public update(): void {
        // do nothing
    }
    public exit(): void {
        this._background.hide();
    }
    public readonly name = "result";

    public setScore(score: number): void {
        if(this._score === score){
            return;
        }
        this._score = score;
        this._scoreLabel.text = `スコア: ${score.toString()}`;
        this._scoreLabel.invalidate();
    }
}