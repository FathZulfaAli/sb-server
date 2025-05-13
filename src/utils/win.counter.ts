const staticRewards: Record<number, number> = {
	1: 500_000_000,
	2: 750_000_000,
	3: 1_000_000_000,
	4: 2_000_000_000,
	5: 3_000_000_000,
};

function winRewardCounter(win: number, ws: number): number {
	let reward = 0;
	if (ws) {
		// just in case if user win streak below 5 streak
		reward = staticRewards[ws] ?? 250_000_000 * Math.min(ws, 100);
	} else {
		reward = staticRewards[win];
	}
	return reward;
}
