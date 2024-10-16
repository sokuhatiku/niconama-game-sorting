import { Timeline } from "@akashic-extension/akashic-timeline";
import { Character, CharacterProfile } from "./character";
import { Area } from "./area";

export interface CharacterPlacedEvent{
    isCorrectArea: boolean;
    area: Area;
    character: Character;
}

/**
 * 全てのキャラクターを管理するクラス
 */
export class CharacterManager {
    private readonly _scene: g.Scene;
    private readonly _timeline: Timeline;
    private readonly _areas: Area[];
    private readonly _root: g.E;

    private readonly _characters: Character[] = [];

    private readonly _characterPlacedTrigger: g.Trigger<CharacterPlacedEvent> = new g.Trigger<CharacterPlacedEvent>();

    public get onCharacterPlaced(): g.Trigger<CharacterPlacedEvent> {
        return this._characterPlacedTrigger;
    }

    public get characters(): readonly Character[] {
        return this._characters;
    }

    public constructor(params: {
        scene: g.Scene
        parent?: g.E | g.Scene
        timeline: Timeline,
        areas: Area[],
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._areas = params.areas;
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
        position: g.CommonOffset,
        profile: CharacterProfile,
    }): void {
        const area = this.defaultArea;
        const character = new Character({
            scene: this._scene,
            timeline: this._timeline,
            profile: params.profile,
            spawnPoint: params.position,
            parent: this._root,
        });

        character.onPointDown.add((ev) => {
            console.log("onPointDown", ev.point);
            const area = this.getCurrentAreaOf(character);
            area?.removeCharacter(character);
        });

        character.onPointUp.add((ev) => {
            console.log("onPointUp", ev.point);
            const area = this.getOverlappedAreaOf(ev.point) ?? this.defaultArea;
            area.addCharacter(character);

            this._characterPlacedTrigger.fire({
                isCorrectArea: area.id === character.profile.goalAreaId,
                area: area,
                character: character,
            });
        });

        area.addCharacter(character);
        this._characters.push(character);
    }

    private get defaultArea(): Area {
        return this._areas[0];
    }

    private getCurrentAreaOf(character: Character): Area | null {
        for (const area of this._areas) {
            if(area.containsCharacter(character)) {
                return area;
            }
        }
        return null;
    }

    private getOverlappedAreaOf(point: g.CommonOffset): Area | null {
        for (const area of this._areas) {
            if (area.contains(point)) {
                return area;
            }
        }
        return null;
    }

    public setAllCharactersInteractable(isInteractable: boolean): void {
        this._characters.forEach(character => {
            character.setInteractable(isInteractable);
        });
    }

    public destroyCharacter(character: Character) {
        const index = this._characters.indexOf(character);
        if (index < 0) return;
        this._characters.splice(index, 1);
        character.destroy();
    }
}
