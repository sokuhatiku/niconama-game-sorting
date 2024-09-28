import { CommonOffset, CommonRect } from "@akashic/akashic-engine"
import { Timeline } from "@akashic-extension/akashic-timeline"
import { Character } from "../entities/character"

const assets = {
	player: "/image/player.png",
	shot: "/image/shot.png",
}

const scene = new g.Scene({
	game: g.game,
	assetPaths: [assets.player, assets.shot],
})

const isRectContainingPoint = (rect: CommonRect, point: CommonOffset): boolean => {
	return point.x >= rect.left &&
		point.x <= rect.right &&
		point.y >= rect.top &&
		point.y <= rect.bottom
}

function setEntityParentWithKeepPosition(entity: g.E, parent: g.E): void {
	const globalEntityPos = entity.localToGlobal({ x: 0, y: 0 })
	parent.append(entity)
	const localEntityPos = parent.globalToLocal(globalEntityPos)
	entity.x = localEntityPos.x
	entity.y = localEntityPos.y
}

scene.onLoad.add(() => {
	const timeline = new Timeline(scene)
	const playerSprite = scene.asset.getImage(assets.player)

	const leftArea = new g.FilledRect({
		scene: scene,
		x: 0,
		y: 200,
		width: 320,
		height: 320,
		cssColor: "rgba(200, 100, 100, 1)",
	})
	scene.append(leftArea)

	const rightArea = new g.FilledRect({
		scene: scene,
		x: 960,
		y: 200,
		width: 320,
		height: 320,
		cssColor: "rgba(100, 100, 200, 1)",
	})
	scene.append(rightArea)

	const centerArea = new g.FilledRect({
		scene: scene,
		x: 320,
		y: 0,
		width: 640,
		height: 720,
		cssColor: "rgba(200, 200, 200, 1)",
	})
	scene.append(centerArea)

	// 掴んでいるキャラクターを最前面に表示するための親としてのエンティティ
	const foreground = new g.E({
		scene: scene,
		x: 0,
		y: 0,
		width: 1280,
		height: 720,
		touchable: false,
	})
	scene.append(foreground)

	for (let i = 0; i < 50; i++) {
		const character = new Character({
			name: `character${i}`,
			scene: scene,
			parent: centerArea,
			timeline: timeline,
			sprite: playerSprite,
		})
		character.onPointDown = (ev) => {
			setEntityParentWithKeepPosition(character.entity, foreground)
		}
		character.onPointUp = (ev) => {
			const worldPoint = character.entity.localToGlobal(ev.point)

			// 左右のエリアに含まれるかどうかを判定
			for (const area of [leftArea, rightArea]) {
				if (isRectContainingPoint(area.calculateBoundingRect(), worldPoint)) {
					setEntityParentWithKeepPosition(character.entity, area)

					// 左右のエリアに含まれている場合はキャラクターを非アクティブにする
					character.setState("inactive")
					return
				}
			}

			// どのエリアにも含まれない場合は中央エリアに戻す
			setEntityParentWithKeepPosition(character.entity, centerArea)
		}
	}
})

const setup = (): void => {
	g.game.pushScene(scene)
}

export default { setup }
