import { Timeline } from "@akashic-extension/akashic-timeline";
import { Character, CharacterProfile } from "./character";
import { Area } from "./area";

/**
 * 全てのキャラクターを管理するクラス
 */
export class CharacterManager {
    private readonly _scene: g.Scene;
    private readonly _timeline: Timeline;
    private readonly _areas: Area[];
    private readonly _root: g.E;

    private readonly _characters: Character[] = [];

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

        character.onPointDown = (ev) => {
            console.log("onPointDown", ev.point);
            const area = this.getCurrentAreaOf(character);
            area.removeCharacter(character);
            this._root.append(character.entity);
            character.entity.modified();
        };

        character.onPointUp = (ev) => {
            console.log("onPointUp", ev.point);
            const area = this.getOverlappedAreaOf(ev.point) ?? this.defaultArea;
            area.addCharacter(character);
        };

        this._areas[0].entity.append(character.entity);
        this._characters.push(character);
    }

    private get defaultArea(): Area {
        return this._areas[0];
    }

    private getCurrentAreaOf(character: Character): Area {
        for (const area of this._areas) {
            const areaChildren = area.entity.children;
            if (!areaChildren) continue;
            if (areaChildren.indexOf(character.entity) >= 0) {
                return area;
            }
        }
        return this.defaultArea;
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
}
