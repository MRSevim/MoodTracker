import { DateTime } from "luxon";

// helper to get color based on x,y
export const getColor = (x: number, y: number) => {
  const valence = (x + 5) / 10; // 0-1 (unpleasant → pleasant)
  const arousal = (y + 5) / 10; // 0-1 (low → high)

  // interpolate between red → green for valence
  const r = Math.round(255 * (1 - valence));
  const g = Math.round(200 * valence);
  const b = Math.round(100 * arousal); // more arousal = brighter

  return `rgb(${r}, ${g}, ${b})`;
};

//gets start and end of day respecting locality
export const getStartAndEndOfToday = (timezone: string) => {
  const now = DateTime.now().setZone(timezone);
  checkDateTimeValidity(now);
  const gte = now.startOf("day").toJSDate();

  const lte = now.endOf("day").toJSDate();

  return { gte, lte };
};

//Helper func to check luxon dates' validity
export function checkDateTimeValidity(
  dt: DateTime<true> | DateTime<false>
): asserts dt is DateTime<true> {
  if (!dt.isValid) {
    throw Error(
      dt.invalidExplanation || "Luxon date is invalid without explanation"
    );
  }
}
