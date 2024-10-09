import { CommonOffset, CommonRect } from "@akashic/akashic-engine"
import { Timeline } from "@akashic-extension/akashic-timeline"
import { createCharacter, Character } from "../entities/character"
import { createScoreboard } from "../entities/scoreboard"
import { createTimer } from "../entities/timer"
import { ScoreHandler } from "../scoreHandler"

const assets = {
    safearea: "/image/safearea.png",
    player: "/image/player.png",
    shot: "/image/shot.png",
    male: "/image/male.png",
    female: "/image/female.png",
    bgm: "/audio/bgm",
    whistle: "/audio/whistle",
}

const assetsArray = [assets.safearea, assets.player, assets.shot, assets.male, assets.female, assets.bgm, assets.whistle]

export type GameSceneParameterObject = {
    scoreHandler: ScoreHandler,
    timelimit: number,
}

export function createGameScene(param: GameSceneParameterObject): g.Scene {
    const scene = new g.Scene({
        game: g.game,
        assetPaths: assetsArray,
    })

    scene.onLoad.add(() => {
        const bgm = scene.asset.getAudio(assets.bgm)
        const bgmContext = g.game.audio.music.create(bgm)
        bgmContext.play()
        const whistle = scene.asset.getAudio(assets.whistle)

        const timeline = new Timeline(scene)
        const femaleSprite = scene.asset.getImage(assets.female)
        const maleSprite = scene.asset.getImage(assets.male)

        const leftArea = new g.FilledRect({
            scene: scene,
            x: 38,
            y: 128,
            width: 301,
            height: 544,
            cssColor: "rgba(200, 100, 100, 1)",
        })
        scene.append(leftArea)

        const rightArea = new g.FilledRect({
            scene: scene,
            x: 941,
            y: 128,
            width: 301,
            height: 544,
            cssColor: "rgba(100, 100, 200, 1)",
        })
        scene.append(rightArea)

        const centerArea = new g.FilledRect({
            scene: scene,
            x: 339,
            y: 128,
            width: 602,
            height: 544,
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
            onScoreUpdated: (score) => {
                param.scoreHandler.notice(score)
            },
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
            whistle.play()
            g.AudioUtil.fadeOut(g.game, bgmContext, 500)
            characters.forEach((character) => {
                character.setInteractable(false)
            })
        }

        const safearea = new g.Sprite({
            scene: scene,
            src: scene.asset.getImage(assets.safearea),
            x: 0,
            y: 0,
            width: 1280,
            height: 720,
            opacity: 0.5,
        })

        scene.append(safearea)
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
