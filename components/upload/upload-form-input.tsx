"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface UploadForm {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const UploadFormInput = forwardRef<HTMLFormElement, UploadForm>(
  ({ onSubmit, isLoading }, ref) => {
    return (
      <form className="flex flex-col gap-6" onSubmit={onSubmit} ref={ref}>
        <div className="flex justify-end items-center gap-1.5">
          <Input
            id="file"
            type="file"
            name="file"
            accept="application/pdf"
            required
            className={cn(isLoading && "opacity-500 cursor-not-allowed")}
            disabled={isLoading}
          />
          <Button disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing ......
              </>
            ) : (
              "Upload Your PDF"
            )}
          </Button>
        </div>
      </form>
    );
  }
);
