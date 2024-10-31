export interface PhaseEnterParams {
	reservedSeconds: number;
	reservedFrames: number;
}

export interface PhaseUpdateParams {
	elapsedSeconds: number;
	elapsedFrames: number;
	progress: number;
}

export interface Phase {
	enter(params: PhaseEnterParams): void;
	update(params: PhaseUpdateParams): void;
	exit(): void;
	get name(): string;
}
