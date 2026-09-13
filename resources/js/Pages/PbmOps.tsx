import { usePage } from "@inertiajs/react";
import PbmOpsApp from "../features/ops/PbmOpsApp";
import type { PbmOpsPageProps } from "../types/ops";

export default function PbmOps() {
  const { auth, users, operations, team, flash } =
    usePage<PbmOpsPageProps>().props;

  return (
    <PbmOpsApp
      authUser={auth.user}
      serverUsers={users}
      serverOperations={operations}
      serverTeam={team}
      flash={flash}
    />
  );
}
