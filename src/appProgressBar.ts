/**
 * アプリ全体の経過時間に対する進捗を示すプログレスバーを表示します。
 */
export class AppProgressBar {
    private readonly _rect: g.FilledRect;
    private readonly _scene: g.Scene;

    public constructor(scene: g.Scene) {
        this._scene = scene;
        const height = 20;
        this._rect = new g.FilledRect({
            scene: this._scene,
            cssColor: "red",
            x: 0,
            y: g.game.height - height,
            width: g.game.width,
            height: height,
        });
        scene.append(this._rect);
    }

    public setProgress(progress: number): void {
        this._rect.width = g.game.width * Math.max(0, Math.min(1, progress));
        this._rect.modified();
    }
}
