"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { checkAuth, returnErrorFromUnknown } from "@/utils/helpers";
import { AddMood } from "../utils/types";
import { checkDateTimeValidity, getStartAndEndOfToday } from "../utils/helpers";
import { routes } from "@/utils/routes";
import { getInsights } from "../utils/MoodInsight-utils";
import { DateTime } from "luxon";

//adds mood with current date or update if already exists
export const addMood = async (entry: AddMood) => {
  try {
    const user = await checkAuth();

    const valence = entry.valence;
    const arousal = entry.arousal;
    const note = entry.note;

    if (
      !Number.isInteger(valence) ||
      !Number.isInteger(arousal) ||
      Math.abs(valence) > 5 ||
      Math.abs(arousal) > 5
    )
      throw Error("Valence and arousal must be whole numbers between -5 and 5");

    const { gte, lte } = getStartAndEndOfToday(user.timezone);

    const existing = await prisma.moodEntry.findFirst({
      where: {
        userId: user.id,
        day: {
          gte,
          lte,
        },
      },
    });

    if (existing) {
      // overwrite existing mood for today
      await prisma.moodEntry.update({
        where: { id: existing.id },
        data: {
          valence,
          arousal,
          note,
        },
      });
    } else {
      // create new mood entry
      await prisma.moodEntry.create({
        data: {
          userId: user.id,
          day: new Date(),
          valence,
          arousal,
          note,
        },
      });
      await prisma.moodEntry.create({
        data: {
          userId: user.id,
          // 2025-12-31 12:00:00 UTC (midday to avoid edge-case timezone shifts)
          day: new Date(Date.UTC(2025, 11, 31, 12, 0, 0)),
          valence,
          arousal,
          note,
        },
      });
    }
  } catch (error) {
    return returnErrorFromUnknown(error);
  }
  redirect(routes.dashboard);
};

//gets the mood of today by scanning between starting and end of the today
export const getTodaysMood = async () => {
  try {
    const user = await checkAuth();

    const { gte, lte } = getStartAndEndOfToday(user.timezone);

    const entry = await prisma.moodEntry.findFirst({
      where: {
        userId: user.id,
        day: {
          gte,
          lte,
        },
      },
    });

    return { entry, error: "" };
  } catch (error) {
    return { entry: null, ...returnErrorFromUnknown(error) };
  }
};

//gets the mood entries of certain month+year or this month if param is not there
export const getMoodsByMonth = async (param: {
  year?: number;
  month?: number;
}) => {
  try {
    const user = await checkAuth();
    const timezone = user.timezone;
    const now = DateTime.now().setZone(timezone);
    checkDateTimeValidity(now);

    const year = param?.year || now.year;
    const month =
      param?.month !== undefined && !isNaN(param?.month)
        ? param.month
        : now.month; // 1-indexed: Jan = 1

    const gte = DateTime.fromObject(
      {
        year,
        month,
      },
      { zone: timezone }
    )
      .startOf("month")
      .toJSDate();

    const lte = DateTime.fromObject(
      {
        year,
        month,
      },
      { zone: timezone }
    )
      .endOf("month")
      .toJSDate();

    // fetch entries for that month
    const entries = (
      await prisma.moodEntry.findMany({
        where: {
          userId: user.id,
          day: {
            gte,
            lte,
          },
        },
        orderBy: {
          day: "asc",
        },
      })
    ).map((e) => {
      const day = DateTime.fromJSDate(e.day, { zone: timezone });
      checkDateTimeValidity(day);
      return { ...e, day };
    });

    const today = DateTime.now().setZone(timezone).startOf("day"); // normalize today to 00:00:00
    const calendarMonth = DateTime.fromObject(
      { year, month },
      { zone: timezone }
    );
    const lastDay = calendarMonth.endOf("month");
    const monthStart = calendarMonth.startOf("month");

    checkDateTimeValidity(today);
    checkDateTimeValidity(lastDay);
    checkDateTimeValidity(monthStart);

    // create full month array
    const calendarDays = Array.from({ length: lastDay.day }, (_, i) => {
      const day = monthStart.plus({ days: i }).startOf("day");
      checkDateTimeValidity(day);
      // find matching entry
      const entry = entries.find((e) => {
        const entryDate = e.day.startOf("day");

        return entryDate.equals(day);
      });

      return {
        day,
        entry,
        isFuture: day > today,
      };
    });

    // scan all recorded months/years for frontend selection
    const allEntries = await prisma.moodEntry.findMany({
      where: { userId: user.id },
      select: { day: true },
    });

    // create a Set of unique "year-month" strings
    const availableTimesSet = new Set(
      allEntries.map((e) => {
        const date = DateTime.fromJSDate(e.day, { zone: timezone });
        checkDateTimeValidity(date);
        return `${date.year}-${date.month}`;
      })
    );

    // add current month/year to the Set
    availableTimesSet.add(`${now.year}-${now.month}`);

    const availableTimes = Array.from(availableTimesSet).map((s) => {
      const [y, m] = s.split("-").map(Number);
      return { year: y, month: m };
    });

    return {
      data: {
        calendarDays,
        availableTimes,
        month,
        year,
      },
      error: "",
    };
  } catch (error) {
    return { data: null, ...returnErrorFromUnknown(error) };
  }
};

//Gets the mood entries between now and specified days ago
export const getMoodEntriesByDays = async (days: number = 90) => {
  try {
    const user = await checkAuth();
    const timezone = user.timezone;
    const now = DateTime.now().setZone(timezone);
    checkDateTimeValidity(now);

    const gte = now.minus({ days: days - 1 }); // inclusive

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: user.id,
        day: {
          gte: gte.toJSDate(),
          lte: now.toJSDate(),
        },
      },
      orderBy: { day: "asc" },
    });

    //converts to iso date
    const getIsoDate = (date: Date) => {
      const dt = DateTime.fromJSDate(date, { zone: timezone });

      checkDateTimeValidity(dt);

      return dt.toISODate(); // string
    };

    // map entries to a dictionary for quick lookup
    const entryMap = new Map(
      entries.map((e) => [
        getIsoDate(e.day), //
        { valence: e.valence, arousal: e.arousal },
      ])
    );

    // generate full days array
    const chartData = Array.from({ length: days }, (_, i) => {
      const d = gte.plus({ days: i });
      const day = getIsoDate(d.toJSDate());

      return {
        day: d.toLocaleString(DateTime.DATE_FULL),
        ...entryMap.get(day),
      };
    });

    return { data: chartData, error: "" };
  } catch (error) {
    return { data: [], ...returnErrorFromUnknown(error) };
  }
};

//Gets the insights between now and specified days ago
export const getInsightsByDays = async (days: number = 90) => {
  try {
    const user = await checkAuth();
    const timezone = user.timezone;
    const now = DateTime.now().setZone(timezone);
    checkDateTimeValidity(now);

    const gte = now.minus({ days: days - 1 }); // inclusive

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId: user.id,
        day: {
          gte: gte.toJSDate(),
          lte: now.toJSDate(),
        },
      },
      orderBy: { day: "asc" },
    });

    const MIN_REQUIRED_ENTRIES = 5;

    if (entries.length < MIN_REQUIRED_ENTRIES) {
      return {
        insights: [
          `Not enough data, Please save at least ${MIN_REQUIRED_ENTRIES} mood entries...`,
        ],
        error: "",
        insufficientData: true,
      };
    }

    const insights = getInsights(entries, timezone);

    return { insights, error: "" };
  } catch (error) {
    return { insights: [], ...returnErrorFromUnknown(error) };
  }
};
