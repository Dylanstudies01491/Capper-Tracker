import "dotenv/config";
import { PrismaClient, PickType } from "@prisma/client";
import { gradePick, hashPassword } from "@capper-tracker/core";

const prisma = new PrismaClient();

async function main() {
  await prisma.pickGradeLog.deleteMany();
  await prisma.pick.deleteMany();
  await prisma.capper.deleteMany();
  await prisma.owner.deleteMany();

  const ownerEmail = process.env.OWNER_EMAIL ?? "owner@example.com";
  const ownerPassword = process.env.OWNER_PASSWORD ?? "OwnerPass123!";

  const owner = await prisma.owner.create({
    data: {
      email: ownerEmail,
      passwordHash: await hashPassword(ownerPassword),
      role: "owner"
    }
  });

  await prisma.capper.createMany({
    data: [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "sharp_edge",
        displayName: "Sharp Edge",
        bio: "NFL specialist with data-driven approach.",
        avatarUrl: "https://avatars.dicebear.com/api/identicon/sharp-edge.svg",
        joinDate: new Date("2023-08-01T00:00:00Z"),
        active: true
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "propsqueen",
        displayName: "Props Queen",
        bio: "Player props queen covering NBA and WNBA.",
        avatarUrl: "https://avatars.dicebear.com/api/identicon/props-queen.svg",
        joinDate: new Date("2023-05-12T00:00:00Z"),
        active: true
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "value_vegas",
        displayName: "Value Vegas",
        bio: "Hunting mispriced lines across all sports.",
        avatarUrl: "https://avatars.dicebear.com/api/identicon/value-vegas.svg",
        joinDate: new Date("2022-11-20T00:00:00Z"),
        active: true
      }
    ]
  });

  const picksData = [
    {
      capperId: "11111111-1111-1111-1111-111111111111",
      sport: "NFL",
      homeTeam: "Rams",
      awayTeam: "Seahawks",
      pickType: PickType.spread,
      pickSide: "Rams",
      listedSpreadOrTotal: -3.5,
      pickPrice: -110,
      stake: 1,
      postedAt: new Date("2024-01-10T17:00:00Z"),
      eventDate: new Date("2024-01-10T22:00:00Z"),
      resultScores: { home: 28, away: 20 }
    },
    {
      capperId: "11111111-1111-1111-1111-111111111111",
      sport: "NFL",
      homeTeam: "Chiefs",
      awayTeam: "Chargers",
      pickType: PickType.moneyline,
      pickSide: "Chiefs",
      listedSpreadOrTotal: null,
      pickPrice: -135,
      stake: 1.5,
      postedAt: new Date("2024-01-08T17:00:00Z"),
      eventDate: new Date("2024-01-08T22:00:00Z"),
      resultScores: { home: 24, away: 17 }
    },
    {
      capperId: "11111111-1111-1111-1111-111111111111",
      sport: "NFL",
      homeTeam: "Bills",
      awayTeam: "Jets",
      pickType: PickType.total,
      pickSide: "Under",
      listedSpreadOrTotal: 42.5,
      pickPrice: -105,
      stake: 1,
      postedAt: new Date("2023-12-15T19:00:00Z"),
      eventDate: new Date("2023-12-16T01:00:00Z"),
      resultScores: { home: 21, away: 20 }
    },
    {
      capperId: "22222222-2222-2222-2222-222222222222",
      sport: "NBA",
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      pickType: PickType.total,
      pickSide: "Over",
      listedSpreadOrTotal: 233.5,
      pickPrice: -110,
      stake: 1,
      postedAt: new Date("2024-01-09T18:00:00Z"),
      eventDate: new Date("2024-01-10T03:00:00Z"),
      resultScores: { home: 130, away: 129 }
    },
    {
      capperId: "22222222-2222-2222-2222-222222222222",
      sport: "NBA",
      homeTeam: "Liberty",
      awayTeam: "Aces",
      pickType: PickType.spread,
      pickSide: "Aces",
      listedSpreadOrTotal: +4.5,
      pickPrice: -108,
      stake: 1.25,
      postedAt: new Date("2023-12-20T18:00:00Z"),
      eventDate: new Date("2023-12-21T01:00:00Z"),
      resultScores: { home: 92, away: 94 }
    },
    {
      capperId: "22222222-2222-2222-2222-222222222222",
      sport: "NBA",
      homeTeam: "Celtics",
      awayTeam: "Suns",
      pickType: PickType.moneyline,
      pickSide: "Suns",
      listedSpreadOrTotal: null,
      pickPrice: +150,
      stake: 1,
      postedAt: new Date("2024-01-05T18:00:00Z"),
      eventDate: new Date("2024-01-06T01:00:00Z"),
      resultScores: { home: 101, away: 108 }
    },
    {
      capperId: "33333333-3333-3333-3333-333333333333",
      sport: "NHL",
      homeTeam: "Golden Knights",
      awayTeam: "Oilers",
      pickType: PickType.moneyline,
      pickSide: "Oilers",
      listedSpreadOrTotal: null,
      pickPrice: +120,
      stake: 0.75,
      postedAt: new Date("2024-01-07T18:00:00Z"),
      eventDate: new Date("2024-01-08T03:00:00Z"),
      resultScores: { home: 2, away: 4 }
    },
    {
      capperId: "33333333-3333-3333-3333-333333333333",
      sport: "MLB",
      homeTeam: "Dodgers",
      awayTeam: "Padres",
      pickType: PickType.spread,
      pickSide: "Padres",
      listedSpreadOrTotal: +1.5,
      pickPrice: -115,
      stake: 1,
      postedAt: new Date("2023-08-10T18:00:00Z"),
      eventDate: new Date("2023-08-11T02:00:00Z"),
      resultScores: { home: 5, away: 4 }
    }
  ];

  const extraSamples = Array.from({ length: 12 }).map((_, index) => {
    const isWin = index % 3 !== 0;
    const pickType = index % 2 === 0 ? PickType.moneyline : PickType.spread;
    const stake = 1 + (index % 4) * 0.5;
    const odds = isWin ? -110 : +140;
    const capperId = index % 2 === 0 ? "11111111-1111-1111-1111-111111111111" : "22222222-2222-2222-2222-222222222222";
    const resultScores = isWin ? { home: 4, away: 2 } : { home: 1, away: 3 };
    return {
      capperId,
      sport: "MLB",
      homeTeam: "Team" + index,
      awayTeam: "Opp" + index,
      pickType,
      pickSide: "Team" + index,
      listedSpreadOrTotal: pickType === PickType.spread ? -1.5 : null,
      pickPrice: odds,
      stake,
      postedAt: new Date(Date.now() - index * 86400000),
      eventDate: new Date(Date.now() - index * 86400000 + 7200000),
      resultScores
    };
  });

  const allPicks = [...picksData, ...extraSamples];

  for (const pick of allPicks) {
    const grade = gradePick({
      homeScore: pick.resultScores.home,
      awayScore: pick.resultScores.away,
      pickType: pick.pickType,
      pickSide: pick.pickSide,
      listedSpreadOrTotal: pick.listedSpreadOrTotal,
      pickPrice: pick.pickPrice,
      stake: pick.stake,
      homeTeam: pick.homeTeam,
      awayTeam: pick.awayTeam
    });

    await prisma.pick.create({
      data: {
        capperId: pick.capperId,
        sport: pick.sport,
        homeTeam: pick.homeTeam,
        awayTeam: pick.awayTeam,
        pickType: pick.pickType,
        pickSide: pick.pickSide,
        listedSpreadOrTotal: pick.listedSpreadOrTotal,
        pickPrice: pick.pickPrice,
        stake: pick.stake,
        postedAt: pick.postedAt,
        eventDate: pick.eventDate,
        result: grade.result,
        profit: grade.profit,
        gradedAt: new Date(),
        source: "manual",
        notes: "Seeded result"
      }
    });
  }

  console.log(`Seeded owner ${owner.email} and ${allPicks.length} picks.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
