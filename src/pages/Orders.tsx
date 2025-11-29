import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, Product } from '@/types/database';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(Order & { product: Product | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/orders');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    setOrders((data as any) || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-2">No orders yet</h1>
          <p className="text-muted-foreground mb-8">Start shopping to see your orders here</p>
          <Button onClick={() => navigate('/shop')}>
            Browse Hoodies
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-medium capitalize",
                  getStatusColor(order.status)
                )}>
                  {order.status}
                </span>
              </div>

              <div className="flex gap-4">
                {order.product?.image_url && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={order.product.image_url}
                      alt={order.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{order.product?.name || 'Product unavailable'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Size: {order.size} • Qty: {order.quantity}
                  </p>
                  <p className="font-semibold mt-1">{formatPrice(order.price_paid)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Shipping to:</span>{' '}
                  {order.address}, {order.city}, {order.state} - {order.postal_code}, {order.country}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
