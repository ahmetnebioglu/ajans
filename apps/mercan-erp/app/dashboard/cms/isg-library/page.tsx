import { getIsgDocuments, getIsgCategories } from "../../../actions/cms-actions";
import { IsgLibraryTable } from "./IsgLibraryTable";

export default async function IsgLibraryPage() {
  const [documents, categories] = await Promise.all([
    getIsgDocuments(),
    getIsgCategories()
  ]);

  return (
    <div className="animate-in fade-in duration-700">
      <IsgLibraryTable initialDocuments={documents} initialCategories={categories} />
    </div>
  );
}
