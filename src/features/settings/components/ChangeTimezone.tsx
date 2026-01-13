"use client";

import ErrorMessage from "@/components/ErrorMessage";
import { Button } from "@/components/shadcn/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Spinner } from "@/components/shadcn/shadcn-io/spinner";

import { useActionState, useEffect, useState } from "react";
import { updateTimezone } from "../lib/database";

const ChangeTimezone = ({ currentTimezone }: { currentTimezone: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [detectedTimezone, setDetectedTimezone] = useState("");

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(timezone);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Spinner size={15} />;
  }
  if (detectedTimezone === currentTimezone) return null;

  return <TimezoneChanger detectedTimezone={detectedTimezone} />;
};

export default ChangeTimezone;

const TimezoneChanger = ({
  detectedTimezone,
}: {
  detectedTimezone: string;
}) => {
  const [open, setOpen] = useState(false);
  const [error, action, isPending] = useActionState(async () => {
    const { error } = await updateTimezone(detectedTimezone);
    if (!error) {
      setOpen(false);
    }
    return error;
  }, "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center justify-center gap-2"
          onClick={() => setOpen(true)}
        >
          Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-500">
            Confirm New Timezone
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Your new timezone was detected to be{" "}
            <span className="font-semibold">{detectedTimezone}</span>. Do you
            wanna update it? <br />
          </DialogDescription>
        </DialogHeader>

        <form action={action}>
          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} aria-describedby="zoneChangeError">
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
          {/* Error message */}
          {error && <ErrorMessage error={error} id="zoneChangeError" />}
        </form>
      </DialogContent>
    </Dialog>
  );
};
