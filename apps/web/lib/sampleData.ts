export const sampleCappers = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Sharp Edge",
    avatarUrl: "https://avatars.dicebear.com/api/identicon/sharp-edge.svg",
    bio: "NFL specialist with data-driven approach.",
    joinDate: "2023-08-01T00:00:00Z",
    stats: {
      profit7d: 3.4,
      profit30d: 6.2,
      roi30d: 0.12
    }
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Props Queen",
    avatarUrl: "https://avatars.dicebear.com/api/identicon/props-queen.svg",
    bio: "Player props queen covering NBA and WNBA.",
    joinDate: "2023-05-12T00:00:00Z",
    stats: {
      profit7d: 5.8,
      profit30d: 10.1,
      roi30d: 0.18
    }
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Value Vegas",
    avatarUrl: "https://avatars.dicebear.com/api/identicon/value-vegas.svg",
    bio: "Hunting mispriced lines across all sports.",
    joinDate: "2022-11-20T00:00:00Z",
    stats: {
      profit7d: -1.2,
      profit30d: 2.7,
      roi30d: 0.04
    }
  }
];

export const sampleLeaderboard = [
  {
    capperId: "22222222-2222-2222-2222-222222222222",
    profit: 5.8,
    roi: 0.18,
    wins: 8,
    losses: 4,
    pushes: 1,
    averageOdds: -108,
    averageStake: 1.1,
    picks: 13
  },
  {
    capperId: "11111111-1111-1111-1111-111111111111",
    profit: 3.4,
    roi: 0.1,
    wins: 6,
    losses: 3,
    pushes: 2,
    averageOdds: -112,
    averageStake: 1.2,
    picks: 11
  },
  {
    capperId: "33333333-3333-3333-3333-333333333333",
    profit: -1.2,
    roi: -0.03,
    wins: 4,
    losses: 6,
    pushes: 1,
    averageOdds: +125,
    averageStake: 0.9,
    picks: 11
  }
];

export const samplePicks = [
  {
    id: "pick-1",
    capperId: "22222222-2222-2222-2222-222222222222",
    capperName: "Props Queen",
    sport: "NBA",
    matchup: "Lakers vs Warriors",
    pick: "Over 233.5",
    postedAt: "2024-01-09T18:00:00Z",
    result: "win",
    profit: 0.91,
    stake: 1
  },
  {
    id: "pick-2",
    capperId: "11111111-1111-1111-1111-111111111111",
    capperName: "Sharp Edge",
    sport: "NFL",
    matchup: "Chiefs vs Chargers",
    pick: "Chiefs ML -135",
    postedAt: "2024-01-08T17:00:00Z",
    result: "win",
    profit: 1.11,
    stake: 1.5
  },
  {
    id: "pick-3",
    capperId: "33333333-3333-3333-3333-333333333333",
    capperName: "Value Vegas",
    sport: "NHL",
    matchup: "Golden Knights vs Oilers",
    pick: "Oilers +120",
    postedAt: "2024-01-07T18:00:00Z",
    result: "win",
    profit: 0.9,
    stake: 0.75
  }
];

export const sampleProfitSeries = {
  "11111111-1111-1111-1111-111111111111": [
    { date: "2024-01-01", profit: 0 },
    { date: "2024-01-04", profit: 1.5 },
    { date: "2024-01-07", profit: 2.2 },
    { date: "2024-01-10", profit: 3.4 }
  ],
  "22222222-2222-2222-2222-222222222222": [
    { date: "2024-01-01", profit: 0.5 },
    { date: "2024-01-04", profit: 2.1 },
    { date: "2024-01-07", profit: 4.3 },
    { date: "2024-01-10", profit: 5.8 }
  ],
  "33333333-3333-3333-3333-333333333333": [
    { date: "2024-01-01", profit: 1.1 },
    { date: "2024-01-04", profit: 0.2 },
    { date: "2024-01-07", profit: -0.8 },
    { date: "2024-01-10", profit: -1.2 }
  ]
};
