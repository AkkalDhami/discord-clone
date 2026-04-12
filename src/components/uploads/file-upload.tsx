import { UploadDropzone } from "@/utils/uploadthing";
import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import toast from "react-hot-toast";

type FileUploadProps = {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "serverImage" | "messageFile";
};

export function FileUpload({ value, endpoint, onChange }: FileUploadProps) {
  
  const fileType = value?.split(".").pop();

  console.log({ value });

  if (value && fileType !== "pdf") {
    return (
      <div className="relative flex items-center justify-center">
        <Image
          src={value}
          alt="Server Logo"
          width={100}
          height={100}
          className="size-20 rounded-full object-cover"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
          <IconX className="size-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center justify-center">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline">
          {value}
        </a>
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
          <IconX className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={res => {
          onChange(res?.[0].ufsUrl);
        }}
        onUploadError={(error: Error) => {
          toast.error(error.message);
        }}
      />
    </div>
  );
}
