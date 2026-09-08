import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import PbmOpsApp from "../../../src/pbm_ops_mvp.jsx";

export default function PbmOps() {
  const { auth, users, operations, csrfToken } = usePage().props;

  useEffect(() => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta && csrfToken) meta.content = csrfToken;
  }, [csrfToken]);

  return <PbmOpsApp authUser={auth?.user || null} serverUsers={users || []} serverOperations={operations} />;
}
