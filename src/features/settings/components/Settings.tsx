import { Suspense } from "react";
import DeleteAccountButton from "./DeleteAccountButton";
import Timezone from "./Timezone";
import { Spinner } from "@/components/shadcn/shadcn-io/spinner";

const Settings = () => {
  return (
    <div className="mt-20 flex flex-col items-center gap-3">
      <Suspense fallback={<Spinner size={20} />}>
        <Timezone />
      </Suspense>
      <DeleteAccountButton />
    </div>
  );
};

export default Settings;
