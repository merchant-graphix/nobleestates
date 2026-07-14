import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function ImageGallery({ images }) {
  const [idx, setIdx] = useState(0);

  if (!images || !images.length) {
    return (
      <div className="h-96 bg-gray-200 flex items-center justify-center rounded-xl">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100">
        <img src={images[idx].url} alt={images[idx].alt || 'Property image'} className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIdx(i => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {idx + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === idx ? 'border-indigo-600' : 'border-transparent'
              }`}
            >
              <img src={img.url} alt={img.alt || `Property image ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
