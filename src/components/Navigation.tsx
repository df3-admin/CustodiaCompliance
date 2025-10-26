import { useState } from "react";
import { Menu, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";

// Import logos as base64 or use placeholder images
const custodiaLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTU2NUYxIi8+Cjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkN1c3RvZGlhPC90ZXh0Pgo8L3N2Zz4K";
const vetOwnedLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRjY2MDAiLz4KPHRleHQgeD0iMzIiIHk9IjM4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VkVUPC90ZXh0Pgo8L3N2Zz4K";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>
      
      <nav className="bg-white/95 backdrop-blur-sm py-0.5 sm:py-1 px-4 sm:px-6 border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Left Side - Hamburger Menu */}
          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="w-6 h-6" />
                  <span className="hidden sm:inline text-sm font-medium">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-96 max-w-[90vw] bg-gradient-to-br from-slate-50 to-white flex flex-col">
                <SheetHeader className="border-b border-gray-200 pb-6">
                  <SheetTitle className="flex items-center justify-center">
                    <img src={custodiaLogo} alt="Custodia, LLC" className="h-10" />
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 mt-8 space-y-2">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-1">
                    <Button 
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-accent group"
                      onClick={() => {
                        window.location.href = '/blog';
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors">
                          <BookOpen className="w-full h-full" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Blog & Resources</div>
                          <div className="text-xs text-muted-foreground">Latest insights</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Button>
                    
                    <Button 
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-4 hover:bg-accent group"
                      onClick={() => {
                        window.open('https://custodiallc.com/contact', '_blank');
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors">
                          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">Contact Us</div>
                          <div className="text-xs text-muted-foreground">Get expert help</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Button>
                  </div>
                </div>
                
                {/* Bottom Section - Veteran-Owned & Legal Links */}
                <div className="mt-auto pt-6">
                  <Separator className="mb-6" />
                  <div className="px-3 py-2">
                    {/* Legal Links */}
                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-medium text-muted-foreground text-center tracking-wider uppercase">Legal</div>
                      <div className="space-y-1">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-2 px-3"
                          onClick={() => {
                            window.open('https://custodiallc.com/privacy-policy', '_blank');
                            setIsOpen(false);
                          }}
                        >
                          Privacy Policy
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-2 px-3"
                          onClick={() => {
                            window.open('https://custodiallc.com/terms-of-service', '_blank');
                            setIsOpen(false);
                          }}
                        >
                          Terms of Service
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-2 px-3"
                          onClick={() => {
                            window.open('https://custodiallc.com/cookie-policy', '_blank');
                            setIsOpen(false);
                          }}
                        >
                          Cookie Policy
                        </Button>
                      </div>
                    </div>
                    
                    {/* Veteran-Owned Text */}
                    <p className="text-xs text-muted-foreground text-center">
                      Veteran-Owned
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center - Logo */}
          <div className="flex items-center justify-center flex-1">
            <a href="/" className="flex items-center gap-2">
              <img src={custodiaLogo} alt="Custodia, LLC" className="h-16 sm:h-18 md:h-20 lg:h-24" />
            </a>
          </div>

          {/* Right Side - Veteran Badge */}
          <div className="flex items-center">
            <img src={vetOwnedLogo} alt="US Veteran Owned" className="h-12 sm:h-14 md:h-16" />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
