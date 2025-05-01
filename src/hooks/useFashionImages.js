
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const BUCKET_NAME = "fashion-images";

export const useFashionImages = () => {
  const [savedImages, setSavedImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) {
         // Gracefully handle empty bucket or RLS issues after policy application
         if (error.message.includes("Bucket not found") || error.message.includes("security policy")) {
            console.warn("Fetch warning:", error.message);
            setSavedImages([]); // Set to empty array if bucket isn't ready or policies are wrong
         } else {
             throw error; // Throw other errors
         }
      } else if (data) {
        const imageUrls = data
          .filter(file => file.name !== ".emptyFolderPlaceholder")
          .map(file => {
            const { data: publicURLData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
            // Check if publicURLData exists and has publicUrl property
            const url = publicURLData?.publicUrl || null; 
            if (!url) {
                console.warn(`Could not get public URL for ${file.name}`);
            }
            return {
              id: file.id || file.name, // Use id, fallback to name if id is missing for some reason
              name: file.name,
              url: url,
              path: file.name,
            };
          }).filter(image => image.url !== null); // Filter out images without a URL
        setSavedImages(imageUrls);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        title: "Error Syncing Collection",
        description: error.message || "Could not load your image collection.",
        variant: "destructive",
      });
      setSavedImages([]);
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImagesSelected = (newImages) => {
    setSelectedImages(prev => [...prev, ...newImages.map(img => ({ ...img, isSelected: true }))]); // Mark as selected
  };

  const handleRemoveSelectedImage = (id) => {
    setSelectedImages(prev => prev.filter(image => image.id !== id));
  };

  const handleRemoveSavedImage = async (imageId) => {
    const imageToRemove = savedImages.find(img => img.id === imageId);
    if (!imageToRemove || !imageToRemove.path) {
      toast({ title: "Error", description: "Cannot identify image to remove.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([imageToRemove.path]);
      if (error) {
        throw error;
      }
      setSavedImages(prev => prev.filter(image => image.id !== imageId));
      toast({
        title: "Image Purged",
        description: "The image has been removed from the Nexus.",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error Removing Image",
        description: error.message || "Could not remove the image from storage.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImages = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Select images to add to your collection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const uploadPromises = selectedImages.map(async (image) => {
      // Check if the image already exists in savedImages by name (simple check)
      // A more robust check might involve content hashing if needed
       if (savedImages.some(savedImg => savedImg.name.endsWith(image.name))) {
           console.log(`Skipping duplicate upload for: ${image.name}`);
           // Optionally return minimal data or filter out later
           return null; 
       }

      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '_')}`; // Sanitize name
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, image.file, {
          cacheControl: '3600',
          upsert: false, // Don't overwrite
          contentType: image.type,
        });

      if (error) {
        console.error("Upload error for", image.name, ":", error);
        // Don't throw, just return null or an error object to handle partial success
        return { error: `Failed to upload ${image.name}: ${error.message}` };
      }
      
      const { data: publicURLData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
       const url = publicURLData?.publicUrl || null;
       if (!url) {
           console.warn(`Could not get public URL for uploaded file ${filePath}`);
           // Even if URL fetch fails, the file might be there. Consider how to handle this.
       }

      return { 
         id: data?.id || filePath, 
         name: image.name, // Keep original name for display if needed
         url: url, 
         path: filePath 
      };
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfullyUploaded = results.filter(r => r && !r.error && r.url); // Filter out nulls, errors, and missing URLs
      const erroredUploads = results.filter(r => r && r.error);
      const skippedUploads = results.filter(r => r === null); // Count skipped

      if (successfullyUploaded.length > 0) {
         setSavedImages(prev => [...successfullyUploaded, ...prev]); 
         setSelectedImages([]); 
         toast({
           title: "Collection Updated",
           description: `Saved ${successfullyUploaded.length} new image(s). ${skippedUploads.length > 0 ? `Skipped ${skippedUploads.length} duplicate(s).` : ''}`,
         });
      } else if (erroredUploads.length === selectedImages.length) {
          // Only show error if ALL failed
          toast({
            title: "Upload Failed",
            description: "Could not save any images. Check console or Supabase logs.",
            variant: "destructive"
          });
      } else if (skippedUploads.length === selectedImages.length) {
           toast({
            title: "No New Images",
            description: "Selected images are already in your collection.",
          });
          setSelectedImages([]); // Clear selection even if all were skipped
      } else if (erroredUploads.length > 0) {
          // Partial success
          toast({
            title: "Partial Upload",
            description: `Saved ${successfullyUploaded.length} image(s). ${erroredUploads.length} failed. ${skippedUploads.length > 0 ? `Skipped ${skippedUploads.length}.` : ''}`,
             variant: "destructive" // Indicate something went wrong
          });
          setSelectedImages([]); // Clear selection on partial success too
      }


    } catch (error) {
       // This catch is less likely needed now errors are handled per-upload
       console.error("Critical error during saving process:", error);
       toast({
         title: "Critical Save Error",
         description: "An unexpected error occurred during the save process.",
         variant: "destructive",
       });
    } finally {
      setIsLoading(false);
    }
  };


  const handleClearSelected = () => {
    if (selectedImages.length === 0) return;
    setSelectedImages([]);
    toast({
      title: "Selection Cleared",
      description: "Removed images from the upload queue."
    });
  };

  return {
    savedImages,
    selectedImages,
    isLoading,
    isFetching,
    handleImagesSelected,
    handleRemoveSelectedImage,
    handleRemoveSavedImage,
    handleSaveImages,
    handleClearSelected,
    fetchImages, // Expose fetch function if manual refresh is needed
  };
};

   