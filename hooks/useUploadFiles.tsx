import { useState } from 'react'

const useUploadFiles = () => {
  const [files, setFiles] = useState<File[]>([])

  function uploadAssets(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length == 0) {
      window.alert('No files uploaded')
      return
    }
    const fileList = new Array<File>()
    Array.from(e.target.files).forEach((file) => {
      fileList.push(file)
    })
    setFiles(fileList)
  }

  return {
    uploadAssets,
    files,
  }
}

export default useUploadFiles
