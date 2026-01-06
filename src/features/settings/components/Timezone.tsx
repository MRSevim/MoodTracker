import { Badge } from "@/components/shadcn/badge";
import { checkAuth } from "@/utils/helpers";
import ChangeTimezone from "./ChangeTimezone";

const TimezoneButton = async () => {
  const user = await checkAuth();
  const timezone = user.timezone;
  return (
    <div className="flex gap-3">
      <div>
        Current Timezone: <Badge>{timezone}</Badge>
      </div>
      <ChangeTimezone currentTimezone={timezone} />
    </div>
  );
};

export default TimezoneButton;
