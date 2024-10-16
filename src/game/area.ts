import { Character } from "./character";
import { PositionNavigator } from "./positionNavigator";

export interface AreaParameterObject {
    id: string
    scene: g.Scene
    parent?: g.Scene | g.E
    navigator: PositionNavigator
    updateTrigger: g.Trigger
}

export class Area {
    private _entity: g.E;
    private _characters: Character[] = [];
    private _id: string;
    private _active = true;
    private _innactiveTimer = 0;
    private _navigator: PositionNavigator;

    private _activeTrigger: g.Trigger<boolean> = new g.Trigger();
    public get onActiveChanged(): g.Trigger<boolean> {
        return this._activeTrigger;
    }

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
        this._entity = new g.E({
            scene: param.scene,
            parent: param.parent ?? param.scene,
        });

        this._navigator = param.navigator;

        param.updateTrigger.add(() => {
            if(this._innactiveTimer > 0) {
                this._innactiveTimer -= 1 / g.game.fps;
                if(this._innactiveTimer <= 0) {
                    this.setActive(true);
                }
            }
        }, this);
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
        this._activeTrigger.fire(false);
    }

    private setActive(active: boolean): void {
        if(this._active === active) {
            return;
        }
        this._active = active;
        this._activeTrigger.fire(active);
    }
}
