"use client";

import { useState } from "react";

export default function AdminPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsUploading(true);
    setMessage(null);
    const form = new FormData(formElement);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const result = (await response.json()) as { id?: string; error?: string };
    setIsUploading(false);
    setMessage(
      response.ok
        ? `Uploaded question set ${result.id}.`
        : (result.error ?? "Upload failed."),
    );
    if (response.ok) formElement.reset();
  }

  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: "0 24px" }}>
      <p className="eyebrow">KRILLION / ADMIN</p>
      <h1>Upload question set</h1>
      <p>JSON must be an array containing exactly seven questions.</p>
      <form onSubmit={upload} style={{ display: "grid", gap: 16 }}>
        <input
          name="file"
          type="file"
          accept="application/json,.json"
          required
        />
        <button className="primary-button" type="submit" disabled={isUploading}>
          {isUploading ? "UPLOADING..." : "UPLOAD SET"}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </main>
  );
}
