import { Phase } from "./phase";

/**
 * 何もしないダミー用のフェーズ
 */
export class DoNothingPhase implements Phase {

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
    public readonly name;
    
}