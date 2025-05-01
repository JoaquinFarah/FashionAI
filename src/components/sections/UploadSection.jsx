
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/components/ImageUploader";
import ImageGallery from "@/components/ImageGallery";
import { Save, Trash2, RefreshCw } from "lucide-react";

const UploadSection = ({
  selectedImages,
  handleImagesSelected,
  handleRemoveSelectedImage,
  handleClearSelected,
  handleSaveImages,
  isLoading,
}) => {
  return (
    <Card className="cyber-card overflow-hidden">
      <CardHeader className="border-b border-cyber-border/50">
        <CardTitle className="text-glow-primary">Upload Your Style</CardTitle>
        <CardDescription className="text-cyber-muted">
          Add images to analyze and save to your collection
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ImageUploader onImagesSelected={handleImagesSelected} />

        {selectedImages.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-neon-cyan">Selected Images ({selectedImages.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelected}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            <ImageGallery
              images={selectedImages}
              onRemoveImage={handleRemoveSelectedImage}
            />
          </motion.div>
        )}
      </CardContent>
      {selectedImages.length > 0 && (
        <CardFooter className="border-t border-cyber-border/50 px-6 py-4">
          <Button
            className="w-full cyber-button"
            onClick={handleSaveImages}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving to Nexus...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Collection
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UploadSection;
  