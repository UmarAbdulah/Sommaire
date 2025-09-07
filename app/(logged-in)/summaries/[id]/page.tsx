import SourceInfo from "@/components/summaries/source-info";
import { getSummaryById } from "@/lib/summaries";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import SummaryViewer from "@/components/summaries/summary-viewer";
import SummaryHeader from "@/components/summaries/summary-header";

export default async function SummaryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const summary = await getSummaryById(id);
  console.log(id);
  if (!summary) {
    notFound();
  }

  const {
    title,
    summary_text,
    file_name,
    word_count,
    created_at,
    original_file_url,
  } = summary;

  const readingTime = Math.ceil((word_count || 0) / 200); // Assuming average reading speed of 200 wpm
  return (
    <div className="relative isolate min-h-screen bg-linear-to-b from-rose-50/40 to-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <SummaryHeader
              title={title}
              created_at={created_at}
              readingTime={readingTime}
            />
            {file_name && (
              <SourceInfo
                fileName={file_name}
                originalFileUrl={original_file_url}
                title={title}
                summaryText={summary_text}
                createdAt={created_at}
              />
            )}
          </div>
          <div className="relative mt-4 sm:mt-8 lg:mt-16">
            <div className="relative p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-rose-100/30 transition-all duration-300 hover:shadow-2xl hover:bg-white/90 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-linear-to-br from-rose-50/50 via-orange-50/30 to-transparent opacity-50 rounded-2xl sm:rounded-3xl" />
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-white/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-rose-400" />
                {word_count?.toLocaleString()} words
              </div>
              <div className="relative mt-8 sm:mt-6 flex justify-center">
                <SummaryViewer summary={summary.summary_text} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
