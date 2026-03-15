"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollections, getGalleryImages, getDriveThumbnailUrl, DriveImage, DriveFolder } from "@/lib/drive";
import { ZoomIn, Folder, ArrowLeft, Images, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar, Camera, Sparkles } from "lucide-react";

function CollectionCard({ collection, index, onClick }: { collection: DriveFolder; index: number; onClick: () => void }) {
  const [previewImages, setPreviewImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageCount, setImageCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getGalleryImages(collection.id)
      .then(imgs => {
        if (isMounted) {
          setPreviewImages(imgs.slice(0, 4));
          setImageCount(imgs.length);
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-400 border-t-transparent"></div>
          </div>
        ) : previewImages.length > 0 ? (
          <div className="absolute inset-0 p-1.5">
            <div className={`w-full h-full grid gap-1.5 ${
              previewImages.length >= 3 ? 'grid-cols-2 grid-rows-2' : 
              previewImages.length === 2 ? 'grid-cols-2 grid-rows-1' : 
              'grid-cols-1 grid-rows-1'
            }`}>
              {previewImages.map((img, i) => (
                <div key={img.id} className={`relative w-full h-full bg-gray-100 overflow-hidden rounded-lg ${previewImages.length === 1 ? 'col-span-2 row-span-2' : ''}`}>
                  <img
                    src={img.thumbnailLink || getDriveThumbnailUrl(img.id)}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDriveThumbnailUrl(img.id);
                    }}
                  />
                </div>
              ))}
              {previewImages.length === 3 && (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg border border-gray-100">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Folder className="w-16 h-16 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-purple-600 font-medium">Empty Album</p>
            </div>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
              <Images className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-purple-600 transition-colors">{collection.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading...' : imageCount > 0 ? `${imageCount} photos` : 'Empty'}
        </p>
      </div>
    </motion.div>
  );
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folder');
  const [collections, setCollections] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<DriveFolder | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCollections().then(cols => {
      setCollections(cols);
      // If folder parameter exists, find and select that folder
      if (folderId) {
        const folder = cols.find(f => f.id === folderId);
        if (folder) {
          setSelectedCollection(folder);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch collections:", err);
      setLoading(false);
    });
  }, [folderId]);

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'ArrowLeft' && selectedImage > 0) setSelectedImage(selectedImage - 1);
      if (e.key === 'ArrowRight' && selectedImage < images.length - 1) setSelectedImage(selectedImage + 1);
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, images.length]);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Memories & Moments</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              {selectedCollection ? selectedCollection.name : "Explore captured moments from our events, workshops, and activities"}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="container-custom py-8 md:py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : selectedCollection ? (
            <div>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  if (folderId) {
                    window.history.back();
                  } else {
                    handleBackToCollections();
                  }
                }}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 md:mb-8 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                {folderId ? "Back" : "Back to Albums"}
              </motion.button>

              {loadingImages ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <Images className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No images found in this album</p>
                  {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group shadow-md hover:shadow-xl transition-all"
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.thumbnailLink || getDriveThumbnailUrl(image.id)}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDriveThumbnailUrl(image.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                          <ZoomIn className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No albums found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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

      {/* Enhanced Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && images[selectedImage] && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl z-10 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {selectedImage > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedImage < images.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                onClick={handleNextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={selectedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              src={images[selectedImage]?.thumbnailLink || getDriveThumbnailUrl(images[selectedImage]?.id || '')}
              alt={images[selectedImage]?.name}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white font-medium text-lg">{images[selectedImage]?.name}</p>
              <p className="text-white/60 text-sm mt-1">{selectedImage + 1} / {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
