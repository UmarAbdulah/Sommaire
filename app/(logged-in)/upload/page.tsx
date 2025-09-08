import { MotionDiv } from "@/components/common/motion-wrapper";
import UploadHeader from "@/components/upload/upload";
import UploadForm from "@/components/upload/upload-form";
import { hasReachedUploadLimit } from "@/lib/user";
import { containerVariants } from "@/utils/constant";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const maxDuration = 30;

export default async function Page() {
  const user = await currentUser();

  if (!user?.id) {
    redirect("/sign-in");
  }

  const userId = user.id;

  const { hasReachedLimit } = await hasReachedUploadLimit(userId);

  if (hasReachedLimit) {
    redirect("/dashboard");
  }
  return (
    <section className="min-h-screen">
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
      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8"
      >
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <UploadHeader />
          <UploadForm />
        </div>
      </MotionDiv>
    </section>
  );
}
