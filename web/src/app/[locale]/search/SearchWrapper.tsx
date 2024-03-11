
import { SearchSection } from "@/components/search/SearchSection";
import { ApiKeyModal } from "@/components/openai/ApiKeyModal";
import { fetchSS } from "@/lib/utilsSS";
import { CCPairBasicInfo, DocumentSet, Tag } from "@/lib/types";

import { Persona } from "../admin/personas/interfaces";
import {
  WelcomeModal,
  hasCompletedWelcomeFlowSS,
} from "@/components/initialSetup/welcome/WelcomeModalWrapper";
import { unstable_noStore as noStore } from "next/cache";
import { InstantSSRAutoRefresh } from "@/components/SSRAutoRefresh";
import { personaComparator } from "../admin/personas/lib";
import { FullEmbeddingModelResponse } from "../admin/models/embedding/embeddingModels";
import { NoSourcesModal } from "@/components/initialSetup/search/NoSourcesModal";
import { NoCompleteSourcesModal } from "@/components/initialSetup/search/NoCompleteSourceModal";

export const SearchWrapper = async ({searchTypeDefault}: {searchTypeDefault: string}) => {
  // Disable caching so we always get the up to date connector / document set / persona info
  // importantly, this prevents users from adding a connector, going back to the main page,
  // and then getting hit with a "No Connectors" popup
  noStore();

  const tasks = [
    fetchSS("/manage/indexing-status"),
    fetchSS("/manage/document-set"),
    fetchSS("/persona"),
    fetchSS("/query/valid-tags"),
    fetchSS("/secondary-index/get-embedding-models"),
  ];

  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let results: (
    | Response
    | FullEmbeddingModelResponse
    | null
  )[] = [null, null, null, null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }
  const ccPairsResponse = results[0] as Response | null;
  const documentSetsResponse = results[1] as Response | null;
  const personaResponse = results[2] as Response | null;
  const tagsResponse = results[3] as Response | null;
  const embeddingModelResponse = results[4] as Response | null;


  let ccPairs: CCPairBasicInfo[] = [];
  if (ccPairsResponse?.ok) {
    ccPairs = await ccPairsResponse.json();
  } else {
    console.log(`Failed to fetch connectors - ${ccPairsResponse?.status}`);
  }

  let documentSets: DocumentSet[] = [];
  if (documentSetsResponse?.ok) {
    documentSets = await documentSetsResponse.json();
  } else {
    console.log(
      `Failed to fetch document sets - ${documentSetsResponse?.status}`
    );
  }

  let personas: Persona[] = [];
  if (personaResponse?.ok) {
    personas = await personaResponse.json();
  } else {
    console.log(`Failed to fetch personas - ${personaResponse?.status}`);
  }
  // remove those marked as hidden by an admin
  personas = personas.filter((persona) => persona.is_visible);
  // hide personas with no retrieval
  personas = personas.filter((persona) => persona.num_chunks !== 0);
  // sort them in priority order
  personas.sort(personaComparator);

  let tags: Tag[] = [];
  if (tagsResponse?.ok) {
    tags = (await tagsResponse.json()).tags;
  } else {
    console.log(`Failed to fetch tags - ${tagsResponse?.status}`);
  }

  const embeddingModelVersionInfo =
    embeddingModelResponse && embeddingModelResponse.ok
      ? ((await embeddingModelResponse.json()) as FullEmbeddingModelResponse)
      : null;
  const currentEmbeddingModelName =
    embeddingModelVersionInfo?.current_model_name;
  const nextEmbeddingModelName =
    embeddingModelVersionInfo?.secondary_model_name;


  const hasAnyConnectors = ccPairs.length > 0;
  const shouldShowWelcomeModal =
    !hasCompletedWelcomeFlowSS() &&
    !hasAnyConnectors;
  const shouldDisplayNoSourcesModal =
    ccPairs.length === 0 && !shouldShowWelcomeModal;
  const shouldDisplaySourcesIncompleteModal =
    !ccPairs.some(
      (ccPair) => ccPair.has_successful_run && ccPair.docs_indexed > 0
    ) &&
    !shouldDisplayNoSourcesModal &&
    !shouldShowWelcomeModal;

  return (
    <>
      {shouldShowWelcomeModal && <WelcomeModal />}
      {!shouldShowWelcomeModal &&
        !shouldDisplayNoSourcesModal &&
        !shouldDisplaySourcesIncompleteModal && <ApiKeyModal />}
      {shouldDisplayNoSourcesModal && <NoSourcesModal />}
      {shouldDisplaySourcesIncompleteModal && (
        <NoCompleteSourcesModal ccPairs={ccPairs} />
      )}

      <InstantSSRAutoRefresh />

      <div className="px-24 pt-10 flex flex-col items-center min-h-screen">
        <div className="w-full">
          <SearchSection
            ccPairs={ccPairs}
            documentSets={documentSets}
            personas={personas}
            tags={tags}
            defaultSearchType={searchTypeDefault}
          />
        </div>
      </div>
    </>
  );
}
