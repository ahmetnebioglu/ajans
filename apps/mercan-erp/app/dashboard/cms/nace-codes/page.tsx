import { getNaceCodes } from "../../../actions/cms-actions";
import { NaceCodesTable } from "./NaceCodesTable";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NaceCodesManagementPage() {
  const codes = await getNaceCodes();

  return (
    <div className="p-6 space-y-6 font-medium italic">
      <NaceCodesTable initialData={codes} />
    </div>
  );
}
