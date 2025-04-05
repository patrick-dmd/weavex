import { del, put } from "@vercel/blob";

export async function handleFiles(uploadFiles: File[], deleteFiles: string[]) {
  await Promise.all(deleteFiles.map((url) => del(url)));
  return Promise.all(
    uploadFiles.map((file) =>
      put(file.name, file, { access: "public" }).then((res) => res.url),
    ),
  );
}
