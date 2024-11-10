import type { GameScore } from "../game/gameScore";

export function getNiconamaScoreRuby(score: GameScore): string {
	const sort = ("000" + score.correctSortingCount.toString()).slice(-3);
	const quality = (
		"000" + Math.floor(score.sortingQuality * 100).toString()
	).slice(-3);
	const totalScore = score.totalScore.toLocaleString();

	return `{"rt":"【スコア】","rb":"${totalScore}"},{"rt":"【品質】","rb":"${quality}"},{"rt":"【仕分け数】","rb":"${sort}"}`;
}

export function getNiconamaScore(score: GameScore): number {
	const sort = score.correctSortingCount;
	const quality = Math.floor(score.sortingQuality * 100);
	return sort + quality * 1000 + score.totalScore * 1000000;
}
