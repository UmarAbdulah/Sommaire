import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing } from "uploadthing/next";
import { type FileRouter } from "uploadthing/types";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async () => {
      // Get user info from Clerk
      const user = await currentUser();

      if (!user) throw new UploadThingError("Unauthorized");

      // Pass userId forward so we can attach it to the upload
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Runs after file upload is complete
      console.log("Upload completed for user id:", metadata.userId);

      // ✅ Only return JSON-serializable values (avoid raw file object)
      return {
        userId: metadata.userId,
        fileUrl: file.url,
        fileName: file.name
      };
    }),
} satisfies FileRouter;
