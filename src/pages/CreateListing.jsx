import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to compress images before upload
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas with new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed image as base64 string
          // Adjust quality (0.6 = 60% quality) to reduce file size
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          
          resolve(compressedBase64);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  // Updated image handling function
  const handleImageSubmit = async (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      console.log(`Processing ${files.length} files`);
  
      try {
        const compressedImages = [];
        
        // Process each file one by one
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`Processing file ${i+1}: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB`);
          
          try {
            // Compress the image
            const compressedBase64 = await compressImage(file);
            console.log(`File ${i+1} compressed successfully`);
            
            // Calculate approximate size of base64 string
            const approximateSize = (compressedBase64.length * 0.75) / 1024; // in KB
            console.log(`Compressed size: ~${approximateSize.toFixed(2)}KB`);
            
            compressedImages.push(compressedBase64);
          } catch (error) {
            console.error(`Error compressing file ${i+1}:`, error);
            setImageUploadError(`Failed to compress image ${file.name}`);
            setUploading(false);
            return;
          }
        }
        
        if (compressedImages.length > 0) {
          await sendImagesToBackend(compressedImages);
        } else {
          setImageUploadError("No images were processed successfully");
          setUploading(false);
        }
      } catch (error) {
        console.error("Error in image processing:", error);
        setImageUploadError(`Image processing failed: ${error.message}`);
        setUploading(false);
      }
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };
  
  // Simplified backend upload function
  const sendImagesToBackend = async (base64Urls) => {
    try {
      console.log(`Sending ${base64Urls.length} images to backend`);
      
      let allImageUrls = [];
      let successCount = 0;
      
      // Send each image individually to avoid payload size issues
      for (let i = 0; i < base64Urls.length; i++) {
        try {
          console.log(`Sending image ${i+1} of ${base64Urls.length}`);
          
          const res = await fetch("http://localhost:3000/api/listing/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: [base64Urls[i]] }), // Send just one image at a time
            credentials: "include",
          });
          
          if (!res.ok) {
            console.error(`Error response from server for image ${i+1}:`, res.status);
            continue; // Skip this image but try the next one
          }
          
          const data = await res.json();
          
          if (data.success && data.imageUrls && data.imageUrls.length > 0) {
            allImageUrls = [...allImageUrls, ...data.imageUrls];
            successCount++;
            console.log(`Image ${i+1} uploaded successfully`);
          } else {
            console.error(`Server returned success=false for image ${i+1}`);
          }
        } catch (err) {
          console.error(`Error uploading image ${i+1}:`, err);
          // Continue with next image
        }
      }
      
      // Update state with successfully uploaded images
      if (allImageUrls.length > 0) {
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ...allImageUrls] });
        setImageUploadError(
          successCount < base64Urls.length 
            ? `${successCount} out of ${base64Urls.length} images uploaded successfully` 
            : false
        );
      } else {
        setImageUploadError("Failed to upload any images");
      }
      
      setUploading(false);
    } catch (error) {
      console.error("Error in image upload process:", error);
      setImageUploadError(`Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "text" ||
      e.target.type === "textarea" ||
      e.target.type === "number"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1) {
        return setError("You must upload at least one image");
      }
      if (+formData.regularPrice < +formData.discountPrice) {
        return setError("Discounted Price must be less than Regular Price");
      }
      setLoading(true);
      setError(false);

      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create Your Listing
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4"
        action=""
      >
        <div className="flex flex-col gap-4 flex-1">
          <input
            onChange={handleChange}
            value={formData.name}
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            onChange={handleChange}
            value={formData.description}
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            maxLength="10000"
            minLength="10"
            required
          />
          <input
            onChange={handleChange}
            value={formData.address}
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={formData.type === "sale"}
                type="checkbox"
                id="sale"
                className="w-5"
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={formData.type === "rent"}
                type="checkbox"
                id="rent"
                className="w-5"
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={formData.parking}
                type="checkbox"
                id="parking"
                className="w-5"
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={formData.furnished}
                type="checkbox"
                id="furnished"
                className="w-5"
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                onChange={handleChange}
                checked={formData.offer}
                type="checkbox"
                id="offer"
                className="w-5"
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.bedrooms}
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
              />
              <p>Bedrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.bathrooms}
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
              />
              <p>Bathrooms</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                onChange={handleChange}
                value={formData.regularPrice}
                className="p-3 border border-x-gray-300 rounded-lg"
                type="number"
                id="regularPrice"
                min="1"
                max="1000000000000"
                required
              />
              <div className="flex flex-col items-center">
                <p>Regular Price (₹)</p>
                {/* <span className="text-xs">( ₹ / month)</span> */}
                {formData.type === 'rent' && (
                  <span className='text-xs'>( ₹ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  onChange={handleChange}
                  value={formData.discountPrice}
                  className="p-3 border border-gray-300 rounded-lg"
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="1000000000000"
                  required
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price (₹)</p>
                  {/* <span className="text-xs">( ₹ / month)</span> */}
                  {formData.type === 'rent' && (
                    <span className='text-xs'>( ₹ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-700 ml-2">
              The first Image will be cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(Array.from(e.target.files))} // Convert FileList to an array
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
              disabled={uploading}
            >
              {" "}
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex justify-between p-3 border items-center "
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Listing ..." : "Create Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
