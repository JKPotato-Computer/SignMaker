const CustomImages = (() => {
  const database = IndexDBManager.getDatastore("customImages", {
    keyPath: "fileName",
  });

  const uploadFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please use an image file!");
      return null;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      const image = await new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve({
            fileName: file.name,
            type: file.type,
            data: reader.result,
            dateAdded: new Date().toISOString(),
          });
        };

        reader.onerror = (error) => {
          reject(error);
        };
      });

      await database.put(image);
    } catch (error) {
      alert("Error uploading file.");
      return null;
    }
  };

  const uploadUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], url.split("/").pop(), { type: blob.type });
      return await uploadFile(file);
    } catch (error) {
      alert("Error uploading file from URL.");
      return null;
    }
  };

  const deleteImage = async (fileName) => {
    try {
      await database.delete(fileName);
    } catch (error) {
      alert("Error deleting image.");
    }
  };

  const getAllImages = async () => {
    try {
      return await database.getAll();
    } catch (error) {
      alert("Error fetching images.");
      return [];
    }
  };

  return {
    uploadFile,
    uploadUrl,
    deleteImage,
    getAllImages,
  };
})();
