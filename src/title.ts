export class Title{

    private readonly _titleText: g.Label;

    public constructor(params: {
        scene: g.Scene
        font: g.Font
    }) {
        this._titleText = new g.Label({
            scene: params.scene,
            font: params.font,
            text: "カプセル魚くんを仕分けるゲーム（開発中）",
            fontSize: 64,
            textColor: "black",
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: params.scene
        });
        this._titleText.aligning(g.game.width, "center");
        this._titleText.invalidate();
    }

    public show() {
        this._titleText.show();
    }

    public hide() {
        this._titleText.hide();
    }
}