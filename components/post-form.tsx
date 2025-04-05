'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { toast } from 'sonner';
import { createPost, updatePost } from '@/lib/actions/posts';

type Image = {
  file: File;
  preview: string;
};

type PostFormProps = {
  user: {
    id: string;
    name: string;
    image: string;
  };
  post?: {
    id: string;
    text: string;
    images: string[];
    visibility: string;
  };
};

export default function PostForm({ user, post }: PostFormProps) {
  const [text, setText] = useState(post?.text || '');
  const [images, setImages] = useState<(string | Image)[]>(post?.images || []);
  const [visibility, setVisibility] = useState(post?.visibility || 'public');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file?.type.startsWith('image/')) return toast.error('Invalid image!');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image too large! Max 5MB.');

    setImages(prevImages => [...prevImages, { file, preview: URL.createObjectURL(file) }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return toast.error('Please write something!');
    if (text.length > 500) return toast.error('Text is too long! Max 500 characters.');

    const formData = new FormData();
    formData.append('text', text);
    images.forEach(image => {
      formData.append('image', typeof image === 'string' ? image : image.file);
    });
    formData.append('visibility', visibility);

    startTransition(async () => {
      try {
        post ? await updatePost(post.id, formData) : await createPost(formData);
        toast.success(`Post ${post ? 'updated' : 'created'} successfully!`);
        setText('');
        setImages([]);
        setVisibility('public');
      } catch (error) {
        toast.error(error instanceof Error && error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center space-x-2">
        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
        <span>{user.name}</span>
      </div>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full"
        maxLength={500}
      />
      <Button
        type="button"
        onClick={() => {
          if (images.length < 4) {
            fileInputRef.current?.click();
          } else {
            toast.error('You cannot add more than 4 images!');
          }
        }}
        className="w-full"
      >
        Select an image
      </Button>

      {images.length < 4 && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      )}

      <div className="flex space-x-2 mt-2">
        {images.map((img, index) => (
          <div key={index} className="relative">
            <img src={typeof img === 'string' ? img : img.preview} alt="preview" className="w-16 h-16 object-cover rounded" />
            <button
              type="button"
              onClick={() => setImages(prevImages => prevImages.filter((_, i) => i !== index))}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <Select value={visibility} onValueChange={setVisibility}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">Public</SelectItem>
          <SelectItem value="private">Private</SelectItem>
          <SelectItem value="followers">Followers</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full" disabled={isPending}>Publish</Button>
    </form>
  );
}
