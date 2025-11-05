export type PickType = "spread" | "moneyline" | "total";
export type PickResult = "pending" | "win" | "loss" | "push";
export type PickSource = "manual" | "api" | "webhook";

export interface PickInput {
  id: string;
  capperId: string;
  pickType: PickType;
  pickSide: string;
  pickPrice: number;
  listedSpreadOrTotal: number | null;
  stake: number | null;
  postedAt: Date;
  eventDate: Date;
  sport: string;
  homeTeam: string;
  awayTeam: string;
}

export interface GradeRequest {
  homeScore: number;
  awayScore: number;
  listedSpreadOrTotal?: number | null;
  pickPrice?: number;
  stake?: number | null;
  pickSide: string;
  pickType: PickType;
  homeTeam: string;
  awayTeam: string;
}

export interface GradeResult {
  result: PickResult;
  profit: number;
}
