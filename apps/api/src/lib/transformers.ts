export function normalizePick<T extends { stake: any; profit: any }>(pick: T) {
  return {
    ...pick,
    stake: pick.stake !== null && pick.stake !== undefined ? Number(pick.stake) : null,
    profit: pick.profit !== null && pick.profit !== undefined ? Number(pick.profit) : null
  };
}
