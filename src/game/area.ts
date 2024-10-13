import { Character } from "./character";

export interface AreaParameterObject {
    id: string
    scene: g.Scene
    parent?: g.Scene | g.E
    rect: g.CommonArea
    color: string
}

export function createArea(param: AreaParameterObject): Area {
    return new Area(param);
}

export class Area  {
    private _entity: g.E;
    private _characters: Character[] = [];
    private _rect: g.CommonArea;
    private _id: string;

    public get entity(): g.E {
        return this._entity;
    }

    public get id(): string {
        return this._id;
    }

    /**
     * このエリアに存在するキャラクターのリストを取得します。
     */
    public get characters(): readonly Character[] {
        return this._characters;
    }

    public constructor(param: AreaParameterObject) {
        this._id = param.id;
        const entity = new g.FilledRect({
            scene: param.scene,
            x: param.rect.x,
            y: param.rect.y,
            width: param.rect.width,
            height: param.rect.height,
            cssColor: param.color,
        });
        const parent = param.parent ?? param.scene;
        parent.append(entity);
        this._entity = entity;
        this._rect = param.rect;
    }

    public contains(point: g.CommonOffset): boolean {
        const localPoint = this._entity.globalToLocal(point);
        return localPoint.x >= 0 && localPoint.x <= this._rect.width &&
            localPoint.y >= 0 && localPoint.y <= this._rect.height;
    }

    public addCharacter(character: Character): void {
        this._characters.push(character);
        const worldPoint = character.entity.localToGlobal({ x: 0, y: 0 });
        this._entity.append(character.entity);
        const newLocalPoint = this._entity.globalToLocal(worldPoint);
        character.entity.moveTo(newLocalPoint);
        character.entity.modified();
    }
    
    public removeCharacter(character: Character): void {
        const index = this._characters.indexOf(character);
        if (index >= 0) {
            this._characters.splice(index, 1);
        }
        const worldPoint = character.entity.localToGlobal({ x: 0, y: 0 });
        character.entity.remove();
        character.entity.moveTo(worldPoint);
        character.entity.modified();
    }
}
