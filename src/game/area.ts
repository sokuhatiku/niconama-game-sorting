import { Character } from "./character";
import { PositionNavigator } from "./positionNavigator";

export interface AreaParameterObject {
	id: string;
	scene: g.Scene;
	parent?: g.Scene | g.E;
	navigator: PositionNavigator;
	updateTrigger: g.Trigger;
}

export class Area {
	private _entity: g.E;
	private _characters: Character[] = [];
	private _id: string;
	private _navigator: PositionNavigator;

	public get entity(): g.E {
		return this._entity;
	}

	public get id(): string {
		return this._id;
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
}
