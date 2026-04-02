// "use client";

import { UploadDropzone } from "@/utils/uploadthing";
import "@uploadthing/react/styles.css";

type FileUploadProps = {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "serverImage" | "messageFile";
};

export function FileUpload({ value, endpoint, onChange }: FileUploadProps) {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return <div></div>;
  }

  return (
    <div className="flex items-center justify-center">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={res => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
