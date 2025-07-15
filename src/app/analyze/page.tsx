import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadIcon, ImageIcon, ZapIcon } from "lucide-react";

function UploadSection() {
  return (
    <Section id="upload">
      <div className="border-x border-t">
        <div className="max-w-4xl mx-auto p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance mb-6">
              Analyze Your Rock
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Upload a clear photo of your rock or mineral specimen and get instant AI-powered analysis with 3D visualization.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold">Upload Rock Photo</CardTitle>
              <p className="text-muted-foreground">
                Drag and drop your image or click to browse
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium mb-2">Drop your rock photo here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports JPG, PNG, and HEIC formats up to 10MB
                    </p>
                    <Button className="w-full sm:w-auto">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-primary" />
                  What happens next?
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-primary">1.</span>
                    <span>AI analyzes your photo to identify mineral composition</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-primary">2.</span>
                    <span>Depth estimation creates a 3D model from your 2D image</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-primary">3.</span>
                    <span>Get detailed results with interactive 3D visualization</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Your photos are processed securely and are not stored on our servers
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function AnalyzePage() {
  return (
    <main>
      <Header />
      <UploadSection />
      <Footer />
    </main>
  );
} 