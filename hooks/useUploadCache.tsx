import { useState } from 'react';

const useUploadCache = () => {
  const [cache, setCache] = useState<File>();

  function uploadCache(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length == 0) {
      window.alert('No files uploaded');
      return;
    }
    const fileList = new Array<File>();
    Array.from(e.target.files).forEach((file) => {
      fileList.push(file);
    });
    setCache(fileList[0]);
  }

  return {
    uploadCache,
    cache:cache!,
  };
};

export default useUploadCache;
