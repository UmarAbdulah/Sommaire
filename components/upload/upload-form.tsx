"use client";

import * as React from "react";
import { UploadFormInput } from "./upload-form-input";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import * as Toast from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";
import { formatFileNameAsTitle } from "@/utils/formatutil";

// ✅ Import the server action instead of fetch
import { enqueuePdfSummary } from "@/actions/upload-actions";

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
      setToastTitle("Uploading...");
      setToastDescription("Hang tight, we’re saving your PDF.");
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

      const validated = schema.safeParse({ file });
      if (!validated.success) {
        setToastTitle(
          validated.error.flatten().fieldErrors.file?.[0] ?? "Invalid File"
        );
        setToastDescription("");
        setToastStatus("error");
        setToastOpen(true);
        return;
      }

      // ✅ Upload file
      const uploadResponse: any = await startUpload([file]);
      if (!uploadResponse || !uploadResponse[0]?.url) {
        throw new Error("File upload failed");
      }
      const fileUrl = uploadResponse[0].url;
      const formattedFileName = formatFileNameAsTitle(file.name);

      // ✅ Call server action directly (no fetch)
      const enqueueRes = await enqueuePdfSummary({
        fileUrl,
        fileName: file.name,
        title: formattedFileName,
      });

      if (!enqueueRes.success || !enqueueRes.data) {
        throw new Error(enqueueRes.message || "Failed to enqueue");
      }

      // Redirect immediately
      router.push(`/summaries/${enqueueRes.data}?status=pending`);
    } catch (error) {
      console.error(error);
      setToastTitle("Error");
      setToastDescription(
        error instanceof Error ? error.message : "Something went wrong"
      );
      setToastStatus("error");
      setToastOpen(true);
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        <UploadFormInput
          isLoading={isLoading}
          ref={formRef}
          onSubmit={handleSubmit}
        />
      </div>
      <Toast.Root open={toastOpen} onOpenChange={setToastOpen}>
        <Toast.Title>{toastTitle}</Toast.Title>
        <Toast.Description>{toastDescription}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport />
    </Toast.Provider>
  );
}
