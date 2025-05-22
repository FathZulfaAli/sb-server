// User win static rewards for up to 5 wins, and if keep winning after that,
// the reward will counted with win streak
const staticRewards: Record<number, number> = {
	1: 50_000_000,
	2: 75_000_000,
	3: 100_000_000,
	4: 125_000_000,
	5: 150_000_000,
};

export function winRewardCounter(win: number, ws: number): number {
	let reward = 0;
	if (ws) {
		// just in case if user win streak below 5 streak
		reward = staticRewards[ws] ?? 250_000_000 * Math.min(ws, 100);
	} else {
		reward = staticRewards[win];
	}
	return reward;
}
