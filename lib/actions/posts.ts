"use server";

import { getCurrentUserId } from "../auth";
import { handleFiles } from "../file-service";
import { prisma } from "../prisma";
import { postSchema } from "../validation";

export async function createPost(formData: FormData, parentId?: string) {
  try {
    const userId = await getCurrentUserId();
    const { text, images, visibility } = postSchema.parse({
      text: formData.get("text"),
      images: formData.getAll("image"),
      visibility: formData.get("visibility"),
    });

    const files = images.filter((image) => image instanceof File);

    const { id } = await prisma.post.create({
      data: {
        text,
        images: await handleFiles(files, []),
        visibility,
        userId,
        parentId,
      },
    });

    return id;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again later.",
    );
  }
}

export async function updatePost(id: string, formData: FormData) {
  try {
    const userId = await getCurrentUserId();
    const { text, images, visibility } = postSchema.parse({
      text: formData.get("text"),
      images: formData.getAll("image"),
      visibility: formData.get("visibility"),
    });

    const urls = images.filter((image) => typeof image === "string");
    const files = images.filter((image) => image instanceof File);

    const { images: prevImages } = await prisma.post.findUniqueOrThrow({
      where: { id, images: { hasEvery: urls }, userId },
      select: { images: true },
    });

    await prisma.post.update({
      where: { id },
      data: {
        text,
        images: [
          ...urls,
          ...(await handleFiles(
            files,
            prevImages.filter((image) => !urls.includes(image)),
          )),
        ],
        visibility,
      },
    });

    return id;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again later.",
    );
  }
}

export async function deletePost(id: string) {
  try {
    const userId = await getCurrentUserId();

    const { images } = await prisma.post.findUniqueOrThrow({
      where: { id, userId },
      select: { images: true },
    });

    await handleFiles([], images);
    await prisma.post.delete({ where: { id } });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again later.",
    );
  }
}
