"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollections, getGalleryImages, getDriveThumbnailUrl, DriveImage, DriveFolder } from "@/lib/drive";
import { ZoomIn, Folder, ArrowLeft, Images, Image as ImageIcon } from "lucide-react";

function CollectionCard({ collection, index, onClick }: { collection: DriveFolder; index: number; onClick: () => void }) {
  const [previewImages, setPreviewImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getGalleryImages(collection.id)
      .then(imgs => {
        if (isMounted) {
          setPreviewImages(imgs.slice(0, 4));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [collection.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
      onClick={onClick}
    >
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : previewImages.length > 0 ? (
          <div className="w-full h-full p-2 bg-white">
            <div className={`w-full h-full grid ${
              previewImages.length >= 3 ? 'grid-cols-2 grid-rows-2' : 
              previewImages.length === 2 ? 'grid-cols-2 grid-rows-1' : 
              'grid-cols-1 grid-rows-1'
            } gap-1.5`}>
              {previewImages.map((img) => (
                <div key={img.id} className="relative w-full h-full bg-gray-100 overflow-hidden rounded-md">
                  <img
                    src={img.thumbnailLink || getDriveThumbnailUrl(img.id)}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDriveThumbnailUrl(img.id);
                    }}
                  />
                </div>
              ))}
              {/* Fill remaining slot if exactly 3 images to complete the 2x2 grid */}
              {previewImages.length === 3 && (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-md border border-gray-100">
                  <ImageIcon className="w-6 h-6 text-gray-200" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Folder className="w-20 h-20 text-purple-400 group-hover:text-purple-500 transition-colors" />
          </div>
        )}
      </div>
      <div className="p-4 text-center border-t border-gray-50">
        <h3 className="font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">{collection.name}</h3>
        <p className="text-sm text-gray-500">{loading ? 'Loading...' : previewImages.length > 0 ? 'Click to view photos' : 'Empty folder'}</p>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [collections, setCollections] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<DriveFolder | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);

  // Load collections on mount
  useEffect(() => {
    getCollections().then(cols => {
      setCollections(cols);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch collections:", err);
      setLoading(false);
    });
  }, []);

  // Load images when collection is selected
  useEffect(() => {
    if (!selectedCollection) return;
    if (fetchedRef.current === selectedCollection.id) return;
    
    fetchedRef.current = selectedCollection.id;
    
    setLoadingImages(true);
    setError(null);
    
    getGalleryImages(selectedCollection.id)
      .then(imgs => {
        setImages(imgs);
        setLoadingImages(false);
      })
      .catch(err => {
        console.error("Failed to fetch images:", err);
        setError(String(err));
        setLoadingImages(false);
      });
  }, [selectedCollection?.id]);

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setImages([]);
    setError(null);
    fetchedRef.current = null;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="container-custom py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Gallery</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {selectedCollection ? selectedCollection.name : "Explore moments from our events and activities"}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : selectedCollection ? (
            <div>
              <button
                onClick={handleBackToCollections}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4 md:mb-6 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Collections
              </button>

              {loadingImages ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No images found</p>
                  {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.thumbnailLink || getDriveThumbnailUrl(image.id)}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDriveThumbnailUrl(image.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No collections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {collections.map((collection, index) => (
                <CollectionCard 
                  key={collection.id} 
                  collection={collection} 
                  index={index} 
                  onClick={() => setSelectedCollection(collection)} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && images[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full z-10"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={images[selectedImage]?.thumbnailLink || getDriveThumbnailUrl(images[selectedImage]?.id || '')}
              alt={images[selectedImage]?.name}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="font-medium">{images[selectedImage]?.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
