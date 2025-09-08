"use client";

import * as React from "react";
import { UploadFormInput } from "./upload-form-input";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import * as Toast from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";
import { formatFileNameAsTitle } from "@/utils/formatutil";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB"
    )
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

type ToastStatus = "success" | "error" | "processing";

export default function UploadForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastTitle, setToastTitle] = React.useState("");
  const [toastDescription, setToastDescription] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [toastStatus, setToastStatus] =
    React.useState<ToastStatus>("processing");

  const { startUpload } = useUploadThing("pdfUploader", {
    onUploadError: (error) => {
      setToastTitle("Upload Failed");
      setToastDescription(error.message);
      setToastStatus("error");
      setToastOpen(true);
    },
    onUploadBegin: () => {
      setToastTitle("Processing PDF...");
      setToastDescription("Hang tight, this may take a few moments.");
      setToastStatus("processing");
      setToastOpen(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;

      const validatedFields = schema.safeParse({ file });
      if (!validatedFields.success) {
        setToastTitle(
          validatedFields.error.flatten().fieldErrors.file?.[0] ??
            "Invalid File"
        );
        setToastDescription("");
        setToastStatus("error");
        setToastOpen(true);
        setIsLoading(false);
        return;
      }

      // 1. Upload file to UploadThing
      const uploadResponse: any = await startUpload([file]);
      if (!uploadResponse || !uploadResponse[0]?.url) {
        throw new Error("File upload failed");
      }

      const fileUrl = uploadResponse[0].url;
      const formattedFileName = formatFileNameAsTitle(file.name);

      // 2. Call lightweight /api/upload
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          fileName: file.name,
          title: formattedFileName,
        }),
      }).then((res) => res.json());

      if (!uploadRes.success) throw new Error("DB save failed");

      const id = uploadRes.data;

      // 3. Kick off background summary processing
      fetch("/api/process-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fileUrl, fileName: file.name }),
      });

      // 4. Redirect user immediately
      router.push(`/summaries/${id}`);
    } catch (error) {
      console.error(error);
      setToastTitle("Error");
      setToastStatus("error");
      setToastOpen(true);
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
    }
  };

  const titleColorClass =
    toastStatus === "success"
      ? "text-green-600"
      : toastStatus === "error"
      ? "text-red-600"
      : "text-black";

  return (
    <Toast.Provider swipeDirection="right">
      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        <UploadFormInput
          isLoading={isLoading}
          ref={formRef}
          onSubmit={handleSubmit}
        />
      </div>

      <Toast.Root
        open={toastOpen}
        onOpenChange={setToastOpen}
        className="border border-gray-300 p-4 rounded-md shadow-md"
      >
        <Toast.Title className={`text-[15px] font-bold ${titleColorClass}`}>
          {toastTitle}
        </Toast.Title>
        <Toast.Description className="text-[13px] text-gray-700">
          {toastDescription}
        </Toast.Description>
      </Toast.Root>

      <Toast.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] flex-col gap-2.5 p-[25px] outline-none" />
    </Toast.Provider>
  );
}
