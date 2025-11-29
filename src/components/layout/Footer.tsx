import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif text-xl font-bold mb-4">Under the Hoodies</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Premium quality hoodies crafted for comfort and style. Every stitch tells a story of warmth and coziness.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">Shop</Link></li>
              <li><Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@underthehoodies.com</li>
              <li>+91 98765 43210</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Under the Hoodies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
