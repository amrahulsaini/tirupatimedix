"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type AdminImageUploadFormProps = {
  entityId: number;
  target: "medicine" | "meril";
};

type UploadStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; text: string }
  | { kind: "error"; text: string };

function messageFromCode(code: string) {
  if (code === "ok") return { kind: "success" as const, text: "Images uploaded successfully." };
  if (code === "empty") return { kind: "error" as const, text: "Select at least one image before uploading." };
  if (code === "invalid") return { kind: "error" as const, text: "Invalid product selected for image upload." };
  if (code === "large") return { kind: "error" as const, text: "One or more images are too large. Keep each file under 10 MB." };
  return { kind: "error" as const, text: "Upload failed due to server error. Please try again." };
}

export function AdminImageUploadForm({ entityId, target }: AdminImageUploadFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<UploadStatus>({ kind: "idle" });

  const actionPath = target === "meril" ? "/admin/upload-meril-images" : "/admin/upload-images";
  const idField = target === "meril" ? "meril_id" : "medicine_id";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus({ kind: "loading" });

    try {
      const response = await fetch(actionPath, {
        method: "POST",
        body: formData,
        headers: {
          "x-medix-ajax": "1",
          Accept: "application/json",
        },
      });

      const payload = (await response.json()) as { status?: string };
      const code = payload.status ?? "server";
      const message = messageFromCode(code);
      setStatus(message);

      if (code === "ok") {
        formRef.current?.reset();
        router.refresh();
      }
    } catch {
      setStatus({ kind: "error", text: "Upload failed due to network/server error. Please try again." });
    }
  }

  return (
    <>
      <form
        ref={formRef}
        action={actionPath}
        method="post"
        encType="multipart/form-data"
        className="admin-upload-form"
        onSubmit={onSubmit}
      >
        <input type="hidden" name={idField} value={entityId} />
        <input type="file" name="images" accept="image/*" multiple required />
        <button type="submit" className="btn btn-secondary" disabled={status.kind === "loading"}>
          <Upload size={16} /> {status.kind === "loading" ? "Uploading..." : "Upload Images"}
        </button>
      </form>

      {status.kind === "success" ? <p className="admin-success">{status.text}</p> : null}
      {status.kind === "error" ? <p className="admin-error">{status.text}</p> : null}
    </>
  );
}
