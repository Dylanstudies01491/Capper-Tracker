/**
 * Calculates the profit for a pick based on American odds.
 * Positive odds express how much profit is earned on a 100 unit stake, while
 * negative odds express how much stake is required to win 100 units.
 *
 * @param odds American odds, e.g. -110 or +150
 * @param stake Amount risked in units. Defaults to 1 unit for reporting when not supplied.
 */
export function calculateProfit(odds: number, stake: number = 1): number {
  if (!Number.isFinite(odds)) {
    throw new Error("Odds must be a finite number");
  }
  if (!Number.isFinite(stake) || stake < 0) {
    throw new Error("Stake must be a non-negative finite number");
  }

  if (stake === 0) {
    return 0;
  }

  if (odds > 0) {
    return (stake * odds) / 100;
  }
  if (odds < 0) {
    return (stake * 100) / Math.abs(odds);
  }

  // Odds of zero represent even money (1:1)
  return stake;
}
