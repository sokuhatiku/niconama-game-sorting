import { Timeline } from "@akashic-extension/akashic-timeline";
import { Character, createCharacter } from "./character";
import { ImageAsset } from "@akashic/akashic-engine";

/**
 * 全てのキャラクターを管理するクラス
 */
export class CharacterManager {
    private readonly _scene: g.Scene;
    private readonly _timeline: Timeline;
    private readonly _root: g.E;

    private readonly _characters: Character[] = [];

    constructor(params: {
        scene: g.Scene
        parent?: g.E | g.Scene
        timeline: Timeline
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._root = new g.E({
            scene: this._scene,
            parent: params.parent ?? this._scene,
        });
    }

    public spawnCharacter(params: {
        x: number, 
        y: number,
        sprite: ImageAsset,
    }): void {
        const character = createCharacter({
            scene: this._scene,
            timeline: this._timeline,
            sprite: params.sprite,
            parent: this._root,
        });
        this._characters.push(character);
    }

    public setAllCharactersInteractable(isInteractable: boolean): void {
        this._characters.forEach(character => {
            character.setInteractable(isInteractable);
        });
    }
}
