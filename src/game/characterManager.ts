import { Timeline } from "@akashic-extension/akashic-timeline";
import { Character, CharacterProfile } from "./character";
import { Area } from "./area";
import { AssetLoader } from "../assetLoader";

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
    private readonly _movableArea: g.CommonArea;
    private readonly _baseLayer: g.E;
    private readonly _pickUpLayer: g.E;
    private readonly _pickSound: g.AudioAsset;
    private readonly _putSound: g.AudioAsset;

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
        baseLayer: g.E
        pickUpLayer: g.E
        timeline: Timeline,
        areas: Area[],
        movableArea: g.CommonArea,
    }) {
        this._scene = params.scene;
        this._timeline = params.timeline;
        this._areas = params.areas;
        this._movableArea = params.movableArea;
        this._baseLayer = params.baseLayer;
        this._pickUpLayer = params.pickUpLayer;

        const assetLoader = new AssetLoader(this._scene);
        this._pickSound = assetLoader.getAudio("/audio/pick");
        this._putSound = assetLoader.getAudio("/audio/put");
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
            parent: this._baseLayer,
            movableArea: this._movableArea,
        });

        character.onPointDown.add((ev) => {
            console.log("onPointDown", ev.point);
            const area = this.getCurrentAreaOf(character);
            area?.removeCharacter(character);
            this._pickUpLayer.append(character.entity);
            this._pickSound.play();
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
            this._baseLayer.append(character.entity);
            this._putSound.play();
        });

        area.addCharacter(character);
        this._characters.push(character);
    }

    private get defaultArea(): Area {
        return this._areas[0];
    }

    private getCurrentAreaOf(character: Character): Area | null {
        for (const area of this._areas) {
            if(area.characters.includes(character)) {
                return area;
            }
        }
        return null;
    }

    private getOverlappedAreaOf(point: g.CommonOffset): Area | null {
        for (const area of this._areas) {
            if (area === this.defaultArea) continue;
            if (area.navigator.containsPoint(point)) {
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
