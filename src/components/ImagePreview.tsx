import { Image } from '@nextui-org/react';

interface ImagePreviewProps {
  src: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src }) => (
  <div>
    <h3 className='font-mono text-1xl mb-2 font-semibold'>Image Preview | Click the extract button above to parse the details</h3>
    <div className='flex justify-center'>
      <Image
        className='h-72 md:h-full'
        alt="Image to be processed"
        src={src}
      />
    </div>
  </div>
)

export default ImagePreview
