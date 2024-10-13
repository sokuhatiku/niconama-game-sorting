import { Timeline } from "@akashic-extension/akashic-timeline";
import { Character, CharacterProfile } from "./character";

/**
 * 全てのキャラクターを管理するクラス
 */
export class CharacterManager {
    private readonly _scene: g.Scene;
    private readonly _timeline: Timeline;
    private readonly _root: g.E;

    private readonly _characters: Character[] = [];

    public constructor(params: {
        scene: g.Scene
        parent?: g.E | g.Scene
        timeline: Timeline
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._root = new g.E({
            scene: params.scene,
            x: 0,
            y: 0,
            width: g.game.width,
            height: g.game.height,
            parent: params.parent ?? params.scene,
        });
    }

    public spawnCharacter(params: {
        x: number, 
        y: number,
        profile: CharacterProfile,
    }): void {
        console.log("spawnCharacter");
        const character = new Character({
            scene: this._scene,
            timeline: this._timeline,
            profile: params.profile,
        });
        this._root.append(character.entity);
        this._characters.push(character);
    }

    public setAllCharactersInteractable(isInteractable: boolean): void {
        this._characters.forEach(character => {
            character.setInteractable(isInteractable);
        });
    }
}
