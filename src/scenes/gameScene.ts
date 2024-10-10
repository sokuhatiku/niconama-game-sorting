import { AudioAsset } from "@akashic/akashic-engine"
import { Timeline } from "@akashic-extension/akashic-timeline"
import { createCharacter, Character } from "../entities/character"
import { createScoreboard } from "../entities/scoreboard"
import { createTimer } from "../entities/timer"
import { ScoreHandler } from "../scoreHandler"
import { createArea } from "../entities/area"

const assets = [
    "/image/safearea.png",
    "/image/player.png", 
    "/image/shot.png",
    "/image/male.png",
    "/image/female.png",
    "/audio/bgm",
    "/audio/whistle",
] as const

type AssetType = (typeof assets)[number]

export type GameSceneParameterObject = {
    scoreHandler: ScoreHandler,
    timelimit: number,
}

function getAudio(scene: g.Scene, asset: AssetType): AudioAsset{
    return scene.asset.getAudio(asset)
}

function getImage(scene: g.Scene, asset: AssetType): g.ImageAsset{
    return scene.asset.getImage(asset)
}

export function createGameScene(param: GameSceneParameterObject): g.Scene {
    const scene = new g.Scene({
        game: g.game,
        assetPaths: [...assets],
    })

    scene.onLoad.add(() => {

        const bgm = getAudio(scene, "/audio/bgm")
        const bgmContext = g.game.audio.music.create(bgm)
        bgmContext.play()
        const whistle = getAudio(scene, "/audio/whistle")

        const timeline = new Timeline(scene)
        const femaleSprite = getImage(scene, "/image/female.png")
        const maleSprite = getImage(scene, "/image/male.png")

        const leftArea = createArea({
            scene: scene,
            rect: { x: 38, y: 128, width: 301, height: 544 },
            color: "rgba(200, 100, 100, 1)",
        })

        const rightArea = createArea({
            scene: scene,
            rect: { x: 941, y: 128, width: 301, height: 544 },
            color: "rgba(100, 100, 200, 1)",
        })

        const centerArea = createArea({
            scene: scene,
            rect: { x: 339, y: 128, width: 602, height: 544 },
            color: "rgba(200, 200, 200, 1)",
        })

        // 掴んでいるキャラクターを最前面に表示するための親としてのエンティティ
        const foreground = new g.E({
            scene: scene,
            x: 0, y: 0, width: 1280, height: 720,
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
                timeline: timeline,
                sprite: genderData[gender].sprite,
            })
            centerArea.addCharacter(character)
            character.onPointDown = (ev) => {
                centerArea.removeCharacter(character)
                setEntityParentWithKeepPosition(character.entity, foreground)
            }
            character.onPointUp = (ev) => {
                const worldPoint = character.entity.localToGlobal(ev.point)

                // 左右のエリアに含まれるかどうかを判定
                for (const area of [leftArea, rightArea]) {
                    if (area.contains(worldPoint)) {
                        area.addCharacter(character)
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
                centerArea.addCharacter(character)
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
            src: getImage(scene, "/image/safearea.png"),
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
    entity.modified()
}
