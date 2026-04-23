"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollections, getGalleryImages, getDriveThumbnailUrl, DriveImage, DriveFolder } from "@/lib/drive";
import { useAuth } from "@/lib/AuthContext";
import { galleryService } from "@/client/services";
import { Gallery } from "@/types";
import { Folder, ArrowLeft, Images, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar, Camera, Sparkles, Plus, Edit, Trash2, MoreVertical, ArrowUpDown, Loader, ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function GalleryCard({ gallery, index, isAdmin, onView, onEdit, onDelete }: {
  gallery: Gallery;
  index: number;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageCount, setImageCount] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    if (gallery.folderId) {
      getGalleryImages(gallery.folderId)
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
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [gallery.folderId]);
  
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const eventDate = new Date(gallery.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group cursor-pointer"
      onClick={onView}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-400 border-t-transparent"></div>
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
              <p className="text-purple-600 font-medium">Empty</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/95 text-purple-600 font-semibold px-3 py-1.5 rounded-lg shadow text-sm">
            {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          {!loading && imageCount > 0 && (
            <span className="bg-black/60 text-white font-semibold px-2 py-1.5 rounded-lg shadow text-xs">
              {imageCount}
            </span>
          )}
        </div>
        
        {isAdmin && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
            <div className="relative">
              <button 
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setOpenMenuId(openMenuId === gallery.id ? null : gallery.id); }}
                className="p-2 bg-white/95 hover:bg-slate-100 text-slate-600 rounded-lg shadow-lg transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {openMenuId === gallery.id && (
                <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-30">
                  <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); onEdit(); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); onDelete(); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-purple-600 transition-colors">{gallery.title}</h3>
      </div>
    </motion.div>
  );
}

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
  const { user } = useAuth();
  const folderId = searchParams.get('folder');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [allFolders, setAllFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<DriveFolder | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [addTitle, setAddTitle] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addFolderId, setAddFolderId] = useState("");
  const [availableFolders, setAvailableFolders] = useState<DriveFolder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch galleries from separate collection
  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const data = await galleryService.getAll();
        setGalleries(data);
        setLoading(false);
        
        // If folderId param exists, auto-select that gallery
        if (folderId) {
          const matchedGallery = data.find(g => g.folderId === folderId);
          if (matchedGallery) {
            // Create a DriveFolder-like object for the selected collection
            setSelectedCollection({ id: matchedGallery.folderId, name: matchedGallery.folderName || matchedGallery.title });
          }
        }
      } catch (err) {
        console.error("Failed to fetch galleries:", err);
        setLoading(false);
      }
    };
    loadGalleries();
  }, [folderId]);

  // Fetch all drive folders when modal opens
  const fetchFoldersForModal = async () => {
    // Get latest galleries to filter properly
    const latestGalleries = await galleryService.getAll();
    setGalleries(latestGalleries);
    
    const driveFolders = await getCollections();
    setAllFolders(driveFolders);
    
    const linkedFolderIds = new Set(latestGalleries.map(g => g.folderId).filter(Boolean));
    if (editingGallery?.folderId) {
      linkedFolderIds.delete(editingGallery.folderId);
    }
    const available = driveFolders.filter(f => !linkedFolderIds.has(f.id));
    setAvailableFolders(available);
  };

  const openAddModal = async () => {
    setAddTitle("");
    setAddDate("");
    setAddFolderId("");
    await fetchFoldersForModal();
    setShowAddModal(true);
  };

  const openEditModal = async (gallery: Gallery) => {
    setEditingGallery(gallery);
    setAddTitle(gallery.title);
    const eventDate = new Date(gallery.date);
    setAddDate(eventDate.toISOString().split('T')[0]);
    setAddFolderId(gallery.folderId || "");
    await fetchFoldersForModal();
    setShowEditModal(true);
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle || !addDate || !addFolderId) return;
    
    setIsSubmitting(true);
    try {
      const selectedFolder = allFolders.find(f => f.id === addFolderId);
      await galleryService.create({
        title: addTitle,
        date: addDate,
        folderId: addFolderId,
        folderName: selectedFolder?.name || "",
        imageUrls: [],
      });
      
      const data = await galleryService.getAll();
      setGalleries(data);
      
      setShowAddModal(false);
      setAddTitle("");
      setAddDate("");
      setAddFolderId("");
    } catch (err) {
      console.error("Failed to add gallery:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery || !addTitle || !addDate || !addFolderId) return;
    
    setIsSubmitting(true);
    try {
      const selectedFolder = allFolders.find(f => f.id === addFolderId);
      await galleryService.update(editingGallery.id, {
        title: addTitle,
        date: addDate,
        folderId: addFolderId,
        folderName: selectedFolder?.name || "",
      });
      
      const data = await galleryService.getAll();
      setGalleries(data);
      
      setShowEditModal(false);
      setEditingGallery(null);
      setAddTitle("");
      setAddDate("");
      setAddFolderId("");
    } catch (err) {
      console.error("Failed to edit gallery:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGallery = async (gallery: Gallery) => {
    if (!confirm(`Delete "${gallery.title}"?`)) return;
    try {
      await galleryService.delete(gallery.id);
      setGalleries(galleries.filter(g => g.id !== gallery.id));
    } catch (err) {
      console.error("Failed to delete gallery:", err);
    }
  };

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

  const handleBackToGalleries = async () => {
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
            {user?.role === "admin" && !selectedCollection && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={openAddModal}
                className="mt-6 inline-flex items-center gap-2 bg-accent text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" /> Add Gallery
              </motion.button>
            )}
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
                    handleBackToGalleries();
                  }
                }}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 md:mb-8 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                {folderId ? "Back" : "Back to Galleries"}
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
          ) : galleries.length === 0 ? (
            <div className="text-center py-20">
              <Folder className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No galleries found</p>
{user?.role === "admin" && !selectedCollection && (
                <button onClick={openAddModal} className="mt-4 text-purple-600 hover:text-purple-800 font-medium">
                  Add your first gallery
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {(() => {
                  const sorted = [...galleries].sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
                  });
                  return sorted.map((gallery, index) => (
                    <GalleryCard 
                      key={gallery.id} 
                      gallery={gallery}
                      index={index}
                      isAdmin={user?.role === "admin"}
                      onView={() => {
                        if (gallery.folderId) {
                          setSelectedCollection({ id: gallery.folderId, name: gallery.folderName || '' });
                          setImages([]);
                        }
                      }}
                      onEdit={() => openEditModal(gallery)}
                      onDelete={() => handleDeleteGallery(gallery)}
                    />
                  ));
                })()}
              </div>
            </>
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
              <p className="text-white/60 text-sm">{selectedImage + 1} / {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Gallery Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Gallery" size="lg">
        <form onSubmit={handleAddGallery} className="space-y-6">
          <Input
            label="Gallery Title"
            placeholder="Enter gallery title"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            required
          />
          <Input
            type="date"
            label="Event/Gallery Date"
            value={addDate}
            onChange={(e) => setAddDate(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Folder from Google Drive
            </label>
            {availableFolders.length === 0 ? (
              <div className="p-4 bg-muted/20 rounded-lg text-center text-muted">
                No folders available. All folders are already linked to events.
              </div>
            ) : (
              <select
                value={addFolderId}
                onChange={(e) => setAddFolderId(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              >
                <option value="">Select a folder</option>
                {availableFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting || availableFolders.length === 0}>
              {isSubmitting ? "Adding..." : "Add Gallery"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Gallery Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Gallery" size="lg">
        <form onSubmit={handleEditGallery} className="space-y-6">
          <Input
            label="Gallery Title"
            placeholder="Enter gallery title"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            required
          />
          <Input
            type="date"
            label="Event/Gallery Date"
            value={addDate}
            onChange={(e) => setAddDate(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Folder from Google Drive
            </label>
            {/* Get current folder name */}
            {(() => {
              const currentFolder = allFolders.find(f => f.id === addFolderId);
              if (!currentFolder && !addFolderId) {
                return (
                  <select
                    value={addFolderId}
                    onChange={(e) => setAddFolderId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  >
                    <option value="">Select a folder</option>
                    {availableFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                );
              }
              return (
                <select
                  value={addFolderId}
                  onChange={(e) => setAddFolderId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                >
                  <option value={addFolderId}>{currentFolder?.name || 'Current Folder'}</option>
                  {availableFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              );
            })()}
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

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
