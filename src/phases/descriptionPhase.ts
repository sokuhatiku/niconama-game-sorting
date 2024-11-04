import { Phase } from ".";
import * as al from "@akashic-extension/akashic-label";

export class DescriptionPhase implements Phase {
	private readonly _background: g.E;

	public constructor(params: { scene: g.Scene; font: g.Font; layer: g.E }) {
		const background = new g.FilledRect({
			scene: params.scene,
			cssColor: "rgba(255, 255, 255, 0.9)",
			x: g.game.width * 0.1,
			y: g.game.height * 0.2,
			width: g.game.width * 0.8,
			height: g.game.height * 0.6,
			parent: params.layer,
		});
		this._background = background;

		const text = `
        ～ルール説明～
        カプセル魚くんには雌雄があります。仕分けてください。
        （←オスは左、メスは右→）
        それぞれのエリアに10匹仕分けると出荷されます。
        （出荷中のエリアは使えません）

        色々調整中、現状スマホとかだと無理ゲーかも

        ～上級者向けヒント～
        左右のエリアを同時に出荷すると出荷時間が短縮されます。
        `;

		new al.Label({
			scene: params.scene,
			text: text,
			font: params.font,
			fontSize: 30,
			x: background.width * 0.05,
			y: background.height * 0.05,
			width: background.width * 0.9,
			height: background.height * 0.9,
			lineBreak: true,
			textAlign: "center",
			parent: background,
		});

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
	public readonly name = "description";
}
