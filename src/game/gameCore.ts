import type { Timeline } from "@akashic-extension/akashic-timeline";
import { AssetLoader } from "../assetLoader";
import type { Layers } from "../utils/layers";
import { Area } from "./area";
import type { CharacterProfile } from "./character";
import { CharacterManager } from "./characterManager";
import type { GameScore } from "./gameScore";
import { ParticleSystem } from "./particleSystem";
import { PolygonNavigator } from "./polygonNavigator";
import { RectNavigator } from "./rectNavigator";
import { ShippingArea } from "./shippingArea";

interface SpawnStatistics {
	maleCount: number;
	femaleCount: number;
}

/**
 * ゲームのコアロジックを管理するクラスです。
 */
export class GameCore {
	private readonly _scene: g.Scene;
	private readonly _assetLoader: AssetLoader;
	private readonly _timeline: Timeline;
	private readonly _characterManager: CharacterManager;
	private readonly _particleSystem: ParticleSystem;

	private readonly _updateTrigger: g.Trigger = new g.Trigger();

	private readonly statistics: SpawnStatistics = {
		maleCount: 0,
		femaleCount: 0,
	};

	private readonly _characterProfiles: {
		male: CharacterProfile;
		female: CharacterProfile;
	};

	private readonly _areas: {
		left: ShippingArea;
		right: ShippingArea;
		center: Area;
	};

	private readonly _layers: Layers;

	private readonly _scoreboard: GameScore;

	private _active: boolean = false;

	private _spawnCooldown: number = 0;

	/**
	 * ゲームを初期化します。
	 * 必用なマネージャーを生成し、必用なエンティティをシーンに追加します。
	 */
	public constructor(params: {
		scene: g.Scene;
		timeline: Timeline;
		layers: Layers;
		scoreCounter: GameScore;
	}) {
		this._scene = params.scene;
		this._assetLoader = new AssetLoader(this._scene);
		this._timeline = params.timeline;
		this._layers = params.layers;
		this._scoreboard = params.scoreCounter;

		this._areas = {
			center: createMainArea({
				scene: this._scene,
				updateTrigger: this._updateTrigger,
				parent: this._layers.gameBackground,
			}),
			left: createShippingArea({
				scene: this._scene,
				updateTrigger: this._updateTrigger,
				id: "left",
				area: { x: 320, y: 272, width: 176, height: 256 },
				cssColor: "rgba(200, 100, 100, 1)",
				parent: this._layers.gameBackground,
			}),
			right: createShippingArea({
				scene: this._scene,
				updateTrigger: this._updateTrigger,
				id: "right",
				area: { x: 784, y: 272, width: 176, height: 256 },
				cssColor: "rgba(100, 100, 200, 1)",
				parent: this._layers.gameBackground,
			}),
		};

		const grabSize = { x: -2, y: 0, width: 36, height: 44 };
		const scale = 1.5;
		const speed = 100 * scale;

		this._characterProfiles = {
			male: {
				activeSprite: this._assetLoader.getImage(
					"/image/male_active.png",
				),
				inactiveSprite: this._assetLoader.getImage(
					"/image/male_inactive.png",
				),
				grabSize: grabSize,
				goalAreaId: this._areas.left.id,
				sizeScale: scale,
				speed: speed,
			},
			female: {
				activeSprite: this._assetLoader.getImage(
					"/image/female_active.png",
				),
				inactiveSprite: this._assetLoader.getImage(
					"/image/female_inactive.png",
				),
				grabSize: grabSize,
				goalAreaId: this._areas.right.id,
				sizeScale: scale,
				speed: speed,
			},
		};

		this._particleSystem = new ParticleSystem({
			scene: this._scene,
			timeline: this._timeline,
			parent: this._layers.gameParticles,
		});

		this._characterManager = new CharacterManager({
			scene: this._scene,
			baseLayer: this._layers.gameForeground,
			pickUpLayer: this._layers.gamePickups,
			timeline: this._timeline,
			areas: [this._areas.center, this._areas.left, this._areas.right],
			movableArea: { x: 320, y: 128, width: 640, height: 544 },
		});

		this._characterManager.onCharacterPlaced.add(
			({ area, character, isCorrectArea }) => {
				// 出荷エリアではない場合は何もしない
				if (!(area instanceof ShippingArea)) {
					return;
				}

				if (isCorrectArea && !area.isShipping) {
					this._scoreboard.incrementCorrectSortingCount();
					this._particleSystem.spawnOKParticle({
						x: character.entity.x,
						y: character.entity.y,
					});
				} else {
					this._scoreboard.incrementIncorrectSortingCount();
					this._particleSystem.spawnNGParticle({
						x: character.entity.x,
						y: character.entity.y,
					});
				}

				if (area.isShipping) {
					// エリアが出荷中であればその場でキャラを削除
					this._characterManager.destroyCharacter(character);
				} else {
					// キャラを非アクティブに変更
					character.setInteractable(false);

					// エリアに10匹以上キャラがいる場合は出荷を開始
					if (area.characters.length >= 10) {
						this.startShipping(area);
					}
				}
			},
		);
	}

	/**
	 * ゲームのアクティブ状態を切り替えます
	 * 非アクティブ状態ではキャラクターのスポーンや操作判定が行われません
	 * @param active 新しいアクティブ状態
	 */
	public setActive(active: boolean): void {
		if (this._active === active) return;
		this._active = active;
		if (active) {
			this.onTurnToActive();
		} else {
			this.onTurnToDeactive();
		}
	}

	// 毎フレーム呼ばれる
	public update(): void {
		if (!this._active) return;

		this._updateTrigger.fire();

		if (this._spawnCooldown > 0) {
			this._spawnCooldown--;
			return;
		}
		this._spawnCooldown = g.game.random.generate() * 5;

		// スポーン処理

		// ゲーム盤上のカプセル魚くんが60匹以上にならないように制限
		if (this._characterManager.characters.length >= 60) {
			return;
		}

		// 雌雄の偏りを一定範囲内に収める
		let isMale: boolean;
		if (this.statistics.maleCount - this.statistics.femaleCount > 10) {
			isMale = false;
		} else if (
			this.statistics.femaleCount - this.statistics.maleCount >
			10
		) {
			isMale = true;
		} else {
			isMale = g.game.random.generate() > 0.5;
		}
		if (isMale) {
			this.statistics.maleCount++;
		} else {
			this.statistics.femaleCount++;
		}

		const isFromTop = g.game.random.generate() > 0.5;
		const spawnPoint: g.CommonOffset = isFromTop
			? { x: g.game.width / 2, y: 0 }
			: { x: g.game.width / 2, y: g.game.height };
		const spawnDirection = angleToDirection(
			(isFromTop ? 45 : 225) + g.game.random.generate() * 90,
		);
		this._characterManager.spawnCharacter({
			position: spawnPoint,
			direction: spawnDirection,
			profile: isMale
				? this._characterProfiles.male
				: this._characterProfiles.female,
		});
	}

	private onTurnToActive(): void {
		this._characterManager.setAllCharactersInteractable(true);
	}

	private onTurnToDeactive(): void {
		this._characterManager.setAllCharactersInteractable(false);
	}

	private startShipping(area: ShippingArea): void {
		const charactersToDestroy = area.characters.slice();
		charactersToDestroy.forEach((c) => {
			area.removeCharacter(c);
			this._characterManager.destroyCharacter(c);
		});
		// 出荷ポイントをスコアに加算
		this._scoreboard.incrementShippedCount();

		// 5秒間出荷中状態にする
		area.startShipping(5);

		if (this._areas.left.isShipping && this._areas.right.isShipping) {
			// 両方のエリアが出荷中状態になっていたらダブル出荷ボーナスを付与
			this._areas.left.setOneTimeBonus();
			this._areas.right.setOneTimeBonus();
			this._scoreboard.incrementDoubleShippedCount();
		}
	}
}

function angleToDirection(angle: number): g.CommonOffset {
	const rad = (angle / 180) * Math.PI;
	return {
		x: Math.cos(rad),
		y: Math.sin(rad),
	};
}

function createMainArea(params: {
	scene: g.Scene;
	updateTrigger: g.Trigger;
	parent: g.E;
}): Area {
	// ゴールエリアを避けるようにポリゴンナビゲーターを作成
	const navigator = new PolygonNavigator(
		[
			{ x: 320, y: 128 },
			{ x: 320, y: 272 },
			{ x: 496, y: 272 },
			{ x: 496, y: 528 },
			{ x: 320, y: 528 },
			{ x: 320, y: 672 },
			{ x: 960, y: 672 },
			{ x: 960, y: 528 },
			{ x: 784, y: 528 },
			{ x: 784, y: 272 },
			{ x: 960, y: 272 },
			{ x: 960, y: 128 },
		],
		{ x: 496, y: 128, width: 288, height: 544 },
	);
	const area = new Area({
		id: "center",
		scene: params.scene,
		navigator: navigator,
		parent: params.parent,
		updateTrigger: params.updateTrigger,
	});
	new g.FilledRect({
		scene: params.scene,
		x: 320,
		y: 128,
		width: 640,
		height: 544,
		cssColor: "rgba(200, 200, 200, 1)",
		parent: area.entity,
	});
	return area;
}

function createShippingArea(params: {
	scene: g.Scene;
	id: string;
	area: g.CommonArea;
	cssColor: string;
	parent: g.E;
	updateTrigger: g.Trigger;
}): ShippingArea {
	const areaObj = new ShippingArea({
		id: params.id,
		scene: params.scene,
		navigator: new RectNavigator(params.area),
		parent: params.parent,
		updateTrigger: params.updateTrigger,
		x: params.area.x,
		y: params.area.y,
		width: params.area.width,
		height: params.area.height,
		cssColor: params.cssColor,
	});

	return areaObj;
}
