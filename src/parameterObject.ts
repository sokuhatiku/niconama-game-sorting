export interface GameMainParameterObject extends g.GameMainParameterObject {
	sessionParameter: {
		mode?: string;
		totalTimeLimit?: number;
		difficulty?: number;
		randomSeed?: number;
	};
	random: g.RandomGenerator;
}
