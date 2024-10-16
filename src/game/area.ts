import { Character } from "./character";
import { PositionNavigator, RectNavigator as RectAreaNavigator } from "./positionNavigator";

export interface Area{
    get entity(): g.E;
    get id(): string;
    get active(): boolean;
    get navigator(): PositionNavigator;
    get characters(): readonly Character[];
    contains(point: g.CommonOffset): boolean;
    addCharacter(character: Character): void;
    removeCharacter(character: Character): void;
    setInnatcive(duration: number): void;
}

export interface AreaParameterObject {
    id: string
    scene: g.Scene
    parent?: g.Scene | g.E
    rect: g.CommonArea
    color: string
    updateTrigger: g.Trigger
}

export class RectArea implements Area {
    private _entity: g.FilledRect;
    private _characters: Character[] = [];
    private _rect: g.CommonArea;
    private _id: string;
    private _color: string;
    private _active = true;
    private _innactiveTimer = 0;
    private _navigator: PositionNavigator;

    public get entity(): g.E {
        return this._entity;
    }

    public get id(): string {
        return this._id;
    }

    public get active(): boolean {
        return this._active;
    }

    public get navigator(): PositionNavigator {
        return this._navigator;
    }

    /**
     * このエリアに存在するキャラクターのリストを取得します。
     */
    public get characters(): readonly Character[] {
        return this._characters;
    }

    public constructor(param: AreaParameterObject) {
        this._id = param.id;
        this._color = param.color;
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

        this._navigator = new RectAreaNavigator(param.rect);

        param.updateTrigger.add(() => {
            if(this._innactiveTimer > 0) {
                this._innactiveTimer -= 1 / g.game.fps;
                if(this._innactiveTimer <= 0) {
                    this.setActive(true);
                }
            }
        }, this);
    }

    public contains(point: g.CommonOffset): boolean {
        const localPoint = this._entity.globalToLocal(point);
        return localPoint.x >= 0 && localPoint.x <= this._rect.width &&
            localPoint.y >= 0 && localPoint.y <= this._rect.height;
    }

    public addCharacter(character: Character): void {
        this._characters.push(character);
        character.setNavigator(this._navigator);
    }
    
    public removeCharacter(character: Character): void {
        const index = this._characters.indexOf(character);
        if (index >= 0) {
            this._characters.splice(index, 1);
        }
        character.setNavigator(null);
    }

    public setInnatcive(duration: number): void {
        this._innactiveTimer = duration;
        this.setActive(false);
    }

    private setActive(active: boolean): void {
        if(this._active === active) {
            return;
        }
        this._active = active;
        this._entity.cssColor = active ? this._color : "black";
        this._entity.modified();
    }
}
