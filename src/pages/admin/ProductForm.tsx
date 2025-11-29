import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { toast } from 'sonner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/');
        return;
      }
      if (isEdit) {
        fetchProduct();
      }
    }
  }, [user, isAdmin, authLoading, navigate, isEdit]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', parseInt(id!))
      .maybeSingle();
    
    if (data) {
      const product = data as Product;
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setSelectedSizes(product.sizes || ['S', 'M', 'L', 'XL']);
      setInStock(product.in_stock);
      setImageUrl(product.image_url || '');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (error) {
      toast.error('Failed to upload image');
    } else {
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
      setImageUrl(urlData.publicUrl);
      toast.success('Image uploaded');
    }

    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price || selectedSizes.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      sizes: selectedSizes,
      in_stock: inStock,
      image_url: imageUrl || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', parseInt(id!));

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated');
        navigate('/admin/products');
      }
    } else {
      const { error } = await supabase.from('products').insert(productData);

      if (error) {
        toast.error('Failed to create product');
      } else {
        toast.success('Product created');
        navigate('/admin/products');
      }
    }

    setSaving(false);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4 max-w-xl">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/admin/products"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>

        <div className="max-w-xl">
          <h1 className="font-serif text-3xl font-bold mb-8">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Product Image</Label>
              <div className="mt-2">
                {imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="w-40 h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Classic Comfort Hoodie"
                required
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A cozy hoodie perfect for any occasion..."
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1499"
                required
                min="0"
                className="mt-1"
              />
            </div>

            {/* Sizes */}
            <div>
              <Label>Available Sizes *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-medium">In Stock</p>
                <p className="text-sm text-muted-foreground">Toggle product availability</p>
              </div>
              <Switch checked={inStock} onCheckedChange={setInStock} />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
