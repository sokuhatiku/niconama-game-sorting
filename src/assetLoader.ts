const imageAssets = [
	"/image/safearea.png",
	"/image/male_active.png",
	"/image/male_inactive.png",
	"/image/female_active.png",
	"/image/female_inactive.png",
	"/image/point.png",
	"/image/circle_gauge_parts.png",
	"/image/double_shipping_bonus.png",
	"/image/shipping.png",
	"/image/checkmark.png",
	"/image/crossmark.png",
] as const;

const audioAssets = [
	"/audio/bgm",
	"/audio/whistle_start",
	"/audio/whistle_finish",
	"/audio/pick",
	"/audio/put",
	"/audio/ok",
	"/audio/ng",
	"/audio/count_up",
	"/audio/count_finish",
] as const;

const textAssets = [] as const;

/**
 * ゲームで利用可能な画像アセットのリテラル型
 * 全てグローバルアセットである想定
 */
export type ImageAssetName = (typeof imageAssets)[number];

/**
 * ゲームで利用可能な音声アセットのリテラル型
 * 全てグローバルアセットである想定
 */
export type AudioAssetName = (typeof audioAssets)[number];

export type TextAssetName = (typeof textAssets)[number];

export const allAssets = [
	...imageAssets,
	...audioAssets,
	...textAssets,
] as const;

/**
 * アセットを取得する操作をtype safeにするためのユーティリティクラス
 */
export class AssetLoader {
	private readonly _scene: g.Scene;

	public constructor(scene: g.Scene) {
		this._scene = scene;
	}

	public getImage(asset: ImageAssetName): g.ImageAsset {
		return this._scene.asset.getImage(asset);
	}

	public getAudio(asset: AudioAssetName): g.AudioAsset {
		return this._scene.asset.getAudio(asset);
	}

	public getText(asset: TextAssetName): g.TextAsset {
		return this._scene.asset.getText(asset);
	}
}
