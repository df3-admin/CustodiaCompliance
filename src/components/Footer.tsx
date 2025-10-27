import { MapPin, Phone, Mail, MessageCircle, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

// Import actual logo image
import custodiaLogo from "../../assets/custodia logo transparent.png";

const Footer = () => {
  return (
    <footer id="contact" className="bg-[hsl(207,89%,15%)] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Logo & Description */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={custodiaLogo} alt="Custodia, LLC" className="h-16 sm:h-20 md:h-24 lg:h-28 brightness-0" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your complete GRC department for software companies. Get enterprise-ready with SOC 2, ISO 27001, HIPAA, PCI DSS, and more. Expert team handles everything - you focus on sales.
            </p>
          </div>

          {/* Blog & Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Blog & Resources</h4>
            <div className="space-y-2">
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="/blog">Latest Articles</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="/blog">Compliance Guides</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="/blog">Best Practices</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="/blog">Industry Insights</a>
              </Button>
            </div>
          </div>

          {/* Security Certifications */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-4">Security Certifications</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {/* Enterprise Deals */}
              <div>
                <h5 className="text-sm font-medium text-blue-400 mb-2">Enterprise Deals ($100K+)</h5>
                <ul className="space-y-1">
                  <li><span className="text-gray-300 text-xs">SOC 2 Type II</span></li>
                  <li><span className="text-gray-300 text-xs">ISO 27001</span></li>
                  <li><span className="text-gray-300 text-xs">NIST CSF</span></li>
                </ul>
              </div>
              
              {/* Industry Specific */}
              <div>
                <h5 className="text-sm font-medium text-blue-400 mb-2">Industry Specific</h5>
                <ul className="space-y-1">
                  <li><span className="text-gray-300 text-xs">HIPAA (Healthcare)</span></li>
                  <li><span className="text-gray-300 text-xs">PCI DSS (Fintech)</span></li>
                  <li><span className="text-gray-300 text-xs">GDPR (Europe)</span></li>
                </ul>
              </div>
              
              {/* Government */}
              <div>
                <h5 className="text-sm font-medium text-blue-400 mb-2">Government</h5>
                <ul className="space-y-1">
                  <li><span className="text-gray-300 text-xs">CMMC</span></li>
                  <li><span className="text-gray-300 text-xs">FedRAMP</span></li>
                  <li><span className="text-gray-300 text-xs">FISMA</span></li>
                </ul>
              </div>
              
              {/* AI & Emerging */}
              <div>
                <h5 className="text-sm font-medium text-blue-400 mb-2">AI & Emerging</h5>
                <ul className="space-y-1">
                  <li><span className="text-gray-300 text-xs">NIST AI RMF</span></li>
                  <li><span className="text-gray-300 text-xs">HITRUST</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact & Resources</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                <span>Pittsburgh, PA</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-0 h-auto" asChild>
                  <a href="/blog">GRC Insights & Blog</a>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-0 h-auto" asChild>
                  <a href="https://custodiallc.com/ai-chat">Chat with AI Consultant</a>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-0 h-auto" asChild>
                  <a href="https://custodiallc.com/contact">Contact Us</a>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-0 h-auto" asChild>
                  <a href="mailto:support@custodiallc.com">Email Support</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="https://custodiallc.com/privacy-policy">Privacy Policy</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="https://custodiallc.com/terms-of-service">Terms of Service</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="https://custodiallc.com/cookie-policy">Cookie Policy</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="https://custodiallc.com/accessibility-statement">Accessibility Statement</a>
              </Button>
              <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-2 h-auto justify-start min-h-[44px]" asChild>
                <a href="https://custodiallc.com/do-not-sell">Do Not Sell My Info</a>
              </Button>
              <div className="pt-2">
                <Button variant="link" size="sm" className="text-gray-300 hover:text-blue-400 p-0 h-auto justify-start text-xs" asChild>
                  <a href="mailto:support@custodiallc.com">Privacy Requests</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8">
          <Separator className="bg-gray-600 mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-gray-300">
                © 2025 Custodia, LLC. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Veteran-Owned Business</span>
                <span>•</span>
                <span>Pittsburgh, PA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
