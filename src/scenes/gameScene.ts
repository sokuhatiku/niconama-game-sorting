import { CommonOffset, CommonRect } from "@akashic/akashic-engine"
import { Timeline } from "@akashic-extension/akashic-timeline"
import { createCharacter, Character } from "../entities/character"
import { createScoreboard } from "../entities/scoreboard"
import { createTimer } from "../entities/timer"
import { ScoreHandler } from "../scoreHandler"

const assets = {
    player: "/image/player.png",
    shot: "/image/shot.png",
    male: "/image/male.png",
    female: "/image/female.png",
}

const assetsArray = [assets.player, assets.shot, assets.male, assets.female]

export function createGameScene(scoreHandler: ScoreHandler): g.Scene {
    const scene = new g.Scene({
        game: g.game,
        assetPaths: assetsArray,
    })

    scene.onLoad.add(() => {
        const timeline = new Timeline(scene)
        const femaleSprite = scene.asset.getImage(assets.female)
        const maleSprite = scene.asset.getImage(assets.male)

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

        const characters: Character[] = []
        const genderData = {
            "male": {
                sprite: maleSprite,
                targetArea: leftArea,
            },
            "female": {
                sprite: femaleSprite,
                targetArea: rightArea,
            },
        }

        const scoreboard = createScoreboard({
            scene: scene,
            parent: foreground,
        })

        for (let i = 0; i < 50; i++) {
            const gender = i % 2 === 0 ? "male" : "female"
            const targetArea = genderData[gender].targetArea

            const character = createCharacter({
                name: `character${i}`,
                scene: scene,
                parent: centerArea,
                timeline: timeline,
                sprite: genderData[gender].sprite,
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
                        character.setInteractable(false)
                        // そのキャラクターにおけるターゲットエリアに含まれる場合はポイントを加算
                        if (area === targetArea) {
                            scoreboard.addCorrectPoint()
                        } else {
                            scoreboard.addIncorrectPoint()
                        }
                        scoreHandler.set(scoreboard.score)
                        return
                    }
                }

                // どのエリアにも含まれない場合は中央エリアに戻す
                setEntityParentWithKeepPosition(character.entity, centerArea)
            }
            characters.push(character)
        }

        const timer = createTimer({
            scene: scene,
            parent: foreground,
        })
        timer.set(30)
        timer.start()
        timer.onTimeUp = () => {
            // ゲーム終了処理を行う
            characters.forEach((character) => {
                character.setInteractable(false)
            })
        }
    })

    return scene
}

/**
 * 矩形と点の当たり判定をチェックする
 * @param rect 判定対象の矩形
 * @param point 判定対象の点
 * @returns 矩形の中に点が含まれている場合はtrue、それ以外はfalse
 */
function isRectContainingPoint(rect: CommonRect, point: CommonOffset): boolean {
    return point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
}

/**
 * エンティティの親を、エンティティのグローバル空間上の位置を保持したまま変更する
 * @param entity 操作対象のエンティティ
 * @param parent 新しい親エンティティ
 */
function setEntityParentWithKeepPosition(entity: g.E, parent: g.E): void {
    const globalEntityPos = entity.localToGlobal({ x: 0, y: 0 })
    parent.append(entity)
    const localEntityPos = parent.globalToLocal(globalEntityPos)
    entity.x = localEntityPos.x
    entity.y = localEntityPos.y
}
