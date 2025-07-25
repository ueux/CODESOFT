import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ImagePlaceholder = ({
  size,
  small,
  pictureUploadingLoader,
  onImageChange,
    onRemove,
  setSelectedImage,
  defaultImage = null,
  index = null,
    setOpenImageModal,
  images
}: {
  size: string;
    small?: boolean;
    pictureUploadingLoader: boolean;
images: any;
  onImageChange: (file: File | null, index: number) => void;
        onRemove?: (index: number) => void;
        setSelectedImage: (e:string) => void;
  defaultImage?: string | null;
  index?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
    }) => {

    const [imagePreview, setImagePreview] = useState<string | null>(defaultImage)
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
            onImageChange(file,index!)
        }
    }
    return (<div className={`relative ${small ? "h-[180px]" : "h-[480px]"} w-full cursor-pointer bg-[#1e1e1e] border border-x-gray-600 rounded-lg flex flex-col items-center justify-center`}>
        <input type="file" placeholder="image" accept="image/*" className="hidden" id={`image-upload-${index}`} onChange={handleFileChange} />
        {imagePreview ? (<>
            <button disabled={pictureUploadingLoader} type="button" onClick={() => onRemove?.(index!)} className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg"><X size={16} /></button>
            <button disabled={pictureUploadingLoader} className="absolute top-3 right-[70px] p-2 !rounded bg-blue-500 shadow-lg cursor-pointer" onClick={() => { setOpenImageModal(true)
            setSelectedImage(images[index].fileUrl)}}> <WandSparkles size={16} /></button>
        </>) : (<>
        <label htmlFor={`image-upload-${index}`} className="absolute top-3 right-3 p-2 !rounded bg-slate-700 shadow-lg cursor-pointer"> <Pencil size={16}/></label>
        </>)}
        {imagePreview?(<>
        <Image width={400} height={300} src={imagePreview} alt="uploaded" className="w-full h-full object-cover rounded-lg"/>
        </>):(<>
        <p className={`text-gray-400 ${small?"text-xl":"text-4xl"} font-semibold`}>{size}</p>
        <p className={`text-gray-500 ${small?"text-sm":"text-lg"} pt-2 text-center`}>Pleace choose an image<br/> according to the expected ratio</p>
        </>)}
    </div>);
};

export default ImagePlaceholder;
