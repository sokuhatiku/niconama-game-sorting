import { Timeline, Tween } from "@akashic-extension/akashic-timeline"

const assets = {
    player: "/image/player.png",
    shot: "/image/shot.png",
}

const scene = new g.Scene({
    game: g.game,
    assetPaths: [assets.player, assets.shot],
})
scene.onLoad.add(() => {
    const timeline = new Timeline(scene)
    const playerSprite = scene.asset.getImage(assets.player)
    const localPlayerEntity = new g.Sprite({
        scene: scene,
        src: playerSprite,
        width: playerSprite.width,
        height: playerSprite.height,
        touchable: true,
    })
    scene.append(localPlayerEntity)

    let isTouching = false
    let currentMoving: Tween

    localPlayerEntity.onPointDown.add((ev) => {
        console.log("onPointDown")
        currentMoving?.cancel()
        isTouching = true
    })
    localPlayerEntity.onPointMove.add((ev) => {
        localPlayerEntity.x += ev.prevDelta.x
        localPlayerEntity.y += ev.prevDelta.y
        localPlayerEntity.modified()
    })
    localPlayerEntity.onPointUp.add((ev) => {
        console.log("onPointUp")
        isTouching = false
    })

    localPlayerEntity.onUpdate.add(() => {
        if (isTouching) {
            return
        }

        if(currentMoving && !currentMoving.isFinished()) {
            return
        }

        // 1秒あたりの移動距離(px)
        const speed = 300

        // 移動先の座標をランダムに決定
        const targetX = Math.floor(g.game.random.generate() * g.game.width)
        const targetY = Math.floor(g.game.random.generate() * g.game.height)

        // 現在の座標から目的地までの距離を計算
        const distanceX = targetX - localPlayerEntity.x
        const distanceY = targetY - localPlayerEntity.y
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)

        // 移動にかかる時間を計算
        const duration = distance / speed * 1000

        // 移動アニメーションを開始
        currentMoving = timeline.create(localPlayerEntity).moveTo(targetX, targetY, duration)

    })
})

const setup = () => {
    g.game.pushScene(scene)
}

export default { setup }
