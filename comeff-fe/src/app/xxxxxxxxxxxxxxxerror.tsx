import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TreePine, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-lg shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <TreePine className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Page Not Found</h2>
          <p className="mb-8 text-muted-foreground">
            Looks like you've wandered off the sustainable path. The page you're looking for doesn't exist.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90"
            >
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="border-border"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default NotFound;
