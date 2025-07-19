import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background text-foreground py-8 mt-8 border-t border-border">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Explore</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary transition-colors">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary transition-colors">
                Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p>Email: support@example.com</p>
          <p>Phone: (123) 456-7890</p>
          <p>Address: 123 E-commerce St, Shop City</p>
        </div>

        {/* Social Media & Theme Switcher */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4 mb-4">
            <a href="https://x.com/OlyMahmudMugdho" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Twitter/X
            </a>
            <a href="https://facebook.com/Oly.Mahmud38" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 text-center border-t border-border pt-4">
        <p>© {new Date().getFullYear()} Distributed Cloud Native E-commerce System. All rights reserved.</p>
      </div>
    </footer>
  );
};