/**
 * ゲームで利用可能な画像アセットのリスト
 * 全てグローバルアセットである想定
 */
export type ImageAssetName = 
    "/image/safearea.png" |
    "/image/male_active.png" |
    "/image/male_inactive.png" |
    "/image/female_active.png" |
    "/image/female_inactive.png";

/**
 * ゲームで利用可能な音声アセットのリスト
 * 全てグローバルアセットである想定
 */
export type AudioAssetName = 
    "/audio/bgm" |
    "/audio/whistle";

/**
 * アセットを取得する操作をtype safeにするためのユーティリティクラス
 */
export class AssetLoader {
    public constructor(private readonly _scene: g.Scene) {
    }

    public getImage(asset: ImageAssetName): g.ImageAsset {
        return this._scene.asset.getImage(asset);
    }

    public getAudio(asset: AudioAssetName): g.AudioAsset {
        return this._scene.asset.getAudio(asset);
    }
}
