"use server";

export async function createPost(formData: FormData) {
  const validation = {
    text: formData.get("text"),
    images: formData.getAll("image"),
    visibility: formData.get("visibility"),
  };

  console.log(validation);
}

export async function updatePost(id: string, formData: FormData) {
  const validation = {
    text: formData.get("text"),
    images: formData.getAll("image"),
    visibility: formData.get("visibility"),
  };

  console.log(validation);
}

export async function deletePost(id: string) {
  // ...
}
