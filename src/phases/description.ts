export class Description{

    private readonly _root: g.E;

    public constructor(params: {
        scene: g.Scene
        font: g.Font
    }) {
        this._root = new g.E({
            scene: params.scene,
            width: g.game.width,
            height: g.game.height,
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: params.scene
        });
        const description1 = new g.Label({
            scene: params.scene,
            font: params.font,
            text: "オス（上が青）を右に、メス（上が赤）を左に仕分けてね",
            fontSize: 30,
            textColor: "black",
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._root
        });
        description1.aligning(g.game.width, "center");
        description1.invalidate();

        const description2 = new g.Label({
            scene: params.scene,
            font: params.font,
            text: "10匹仕分けると出荷中になるから、",
            fontSize: 30,
            textColor: "black",
            x: g.game.width / 2,
            y: g.game.height / 2 + 50,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._root
        });
        description2.aligning(g.game.width, "center");
        description2.invalidate();

        const description3 = new g.Label({
            scene: params.scene,
            font: params.font,
            text: "出荷中は仕分けないよう注意してね",
            fontSize: 30,
            textColor: "black",
            x: g.game.width / 2,
            y: g.game.height / 2 + 100,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._root
        });
        description3.aligning(g.game.width, "center");
        description3.invalidate();

        const description4 = new g.Label({
            scene: params.scene,
            font: params.font,
            text: "（スマホとかだと難しいかも）",
            fontSize: 20,
            textColor: "black",
            x: g.game.width / 2,
            y: g.game.height / 2 + 150,
            anchorX: 0.5,
            anchorY: 0.5,
            parent: this._root
        });
        description4.aligning(g.game.width, "center");
        description4.invalidate();
    }

    public show() {
        this._root.show();
    }

    public hide() {
        this._root.hide();
    }
}