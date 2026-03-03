'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { generateSlug } from '@/lib/utils';

interface ProductFormProps {
    initialData?: {
        id: string;
        title: string;
        description: string;
        price_paise: number;
        slug: string;
        file_path: string;
        cover_image: string | null;
    };
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;

    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [price, setPrice] = useState(
        initialData ? (initialData.price_paise / 100).toString() : ''
    );
    const [file, setFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const pricePaise = Math.round(parseFloat(price) * 100);
            if (isNaN(pricePaise) || pricePaise < 100) {
                throw new Error('Minimum price is ₹1.00');
            }

            let filePath = initialData?.file_path || '';
            let coverUrl = initialData?.cover_image || null;

            // Upload product file
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, file);

                if (uploadError) throw new Error('Failed to upload file: ' + uploadError.message);
                filePath = fileName;
            }

            if (!filePath && !isEditing) {
                throw new Error('Please upload a product file');
            }

            // Upload cover image
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop();
                const coverName = `${user.id}/${Date.now()}-cover.${coverExt}`;
                const { error: coverError } = await supabase.storage
                    .from('covers')
                    .upload(coverName, coverFile);

                if (coverError) throw new Error('Failed to upload cover: ' + coverError.message);

                const { data: publicUrlData } = supabase.storage
                    .from('covers')
                    .getPublicUrl(coverName);
                coverUrl = publicUrlData.publicUrl;
            }

            const slug = generateSlug(title) + '-' + Date.now().toString(36);

            const productData = {
                title,
                description,
                price_paise: pricePaise,
                slug: isEditing ? initialData.slug : slug,
                file_path: filePath,
                cover_image: coverUrl,
                creator_id: user.id,
            };

            if (isEditing) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', initialData.id);
                if (updateError) throw new Error('Failed to update: ' + updateError.message);
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert(productData);
                if (insertError) throw new Error('Failed to create: ' + insertError.message);
            }

            router.push('/dashboard/products');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? 'Edit Product' : 'Create New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-lg border border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5 p-3 text-sm text-[hsl(var(--destructive))]">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Ultimate Design Kit"
                        required
                        minLength={3}
                        maxLength={120}
                    />

                    <Textarea
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your product..."
                        required
                        minLength={10}
                    />

                    <Input
                        label="Price (₹)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="99.00"
                        step="0.01"
                        min="1"
                        required
                        helperText="Minimum ₹1.00"
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">
                            Product File {isEditing && '(leave empty to keep current)'}
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-[hsl(var(--muted-foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[hsl(var(--primary))] file:text-[hsl(var(--primary-foreground))] hover:file:opacity-90 file:cursor-pointer file:transition-opacity"
                            required={!isEditing}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">
                            Cover Image (optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-[hsl(var(--muted-foreground))] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[hsl(var(--secondary))] file:text-[hsl(var(--secondary-foreground))] hover:file:opacity-90 file:cursor-pointer file:transition-opacity"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" loading={loading}>
                            {isEditing ? 'Update Product' : 'Create Product'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
