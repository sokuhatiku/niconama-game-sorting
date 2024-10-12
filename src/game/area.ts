import { Character } from "./character";

export interface Area {
    get entity(): g.E

    addCharacter(character: Character): void
    removeCharacter(character: Character): void

    contains(point: g.CommonOffset): boolean
}

export interface AreaParameterObject {
    name?: string
    scene: g.Scene
    parent?: g.Scene | g.E
    rect: g.CommonArea
    color: string
}

export function createArea(param: AreaParameterObject): Area {
    return new AreaImpl(param);
}

class AreaImpl implements Area {
    private _entity: g.E;
    private _characters: Character[] = [];
    private _rect: g.CommonArea;

    get entity(): g.E {
        return this._entity;
    }

    constructor(param: AreaParameterObject) {
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

    contains(point: g.CommonOffset): boolean {
        const localPoint = this._entity.globalToLocal(point);
        return localPoint.x >= 0 && localPoint.x <= this._rect.width &&
            localPoint.y >= 0 && localPoint.y <= this._rect.height;
    }

    addCharacter(character: Character): void {
        this._characters.push(character);
        const worldPoint = character.entity.localToGlobal({ x: 0, y: 0 });
        this._entity.append(character.entity);
        const newLocalPoint = this._entity.globalToLocal(worldPoint);
        character.entity.moveTo(newLocalPoint);
        character.entity.modified();
    }
    
    removeCharacter(character: Character): void {
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
