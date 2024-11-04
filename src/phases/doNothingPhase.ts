import type { Phase } from ".";

/**
 * 何もしないダミー用のフェーズ
 */
export class DoNothingPhase implements Phase {
	public readonly name: string;

	public constructor(name: string) {
		this.name = name;
	}

	public enter(): void {
		// do nothing
	}
	public update(): void {
		// do nothing
	}
	public exit(): void {
		// do nothing
	}
}
