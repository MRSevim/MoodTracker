import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shadcn/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { CalendarDays } from "lucide-react";
import { getColor } from "../../utils/helpers";
import { Skeleton } from "@/components/shadcn/skeleton";
import { getMoodsByMonth } from "../../lib/database";
import ErrorMessage from "@/components/ErrorMessage";
import DatePicker, { DatePickerSkeleton } from "./DatePicker";
import { DateTime } from "luxon";

const Calendar = async ({
  params,
}: {
  params: { year?: string; month?: string };
}) => {
  const year = Number(params?.year);
  const month = Number(params?.month);
  const { data, error } = await getMoodsByMonth({ year, month });

  if (!data || error) {
    return <ErrorMessage error={error || "Could not fetch the calendar"} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 flex-col">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Mood Calendar</CardTitle>
        <DatePicker
          data={{
            availableTimes: data.availableTimes,
            month: data.month,
            year: data.year,
          }}
        />
      </CardHeader>
      <CardContent>
        {" "}
        <div className="grid grid-cols-7 gap-2">
          <TooltipProvider>
            {data.calendarDays.map((day) => {
              return (
                <Tooltip key={day.day.toMillis()}>
                  <TooltipTrigger asChild>
                    <div
                      tabIndex={0}
                      aria-label="Mood entry"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-md cursor-pointer border"
                      style={{
                        backgroundColor: day.entry
                          ? getColor(day.entry.valence, day.entry.arousal)
                          : day.isFuture
                          ? "var(--color-muted-foreground)" // dark gray for future
                          : "var(--color-muted)", // gray for unreported
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-wrap text-center max-w-50">
                    <p className="text-sm font-medium">
                      {day.day.toLocaleString(DateTime.DATE_FULL)}
                    </p>
                    {day.entry ? (
                      <p className="text-xs text-muted mt-1">
                        Valence: {day.entry.valence}, Arousal:{" "}
                        {day.entry.arousal}
                        <br />
                        {`"${day.entry.note}"` || "No note"}
                      </p>
                    ) : day.isFuture ? (
                      <p className="text-xs text-muted mt-1 italic">
                        Future day
                      </p>
                    ) : (
                      <p className="text-xs text-muted mt-1 italic">No entry</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export const CalendarSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 flex-col">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Mood Calendar</CardTitle>
        <DatePickerSkeleton />
      </CardHeader>
      <CardContent>
        {" "}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-md border"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar;
