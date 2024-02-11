import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Tesseract, { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { ReceiptItem } from './lib/interfaces';
import { transformTesseractRecognizeResultToReceiptItems } from './lib/utils';
import ReceiptPreview from '@/components/ReceiptPreview';
import FileUpload from '@/components/FileUpload';

function App() {
  const [imageData, setImageData] = useState<null | string>(null)
  const [parseResults, setParseResults] = useState<{ status: string, progress: number }>({ status: 'idle', progress: 0 })
  const [tesseractRecognizeResult, setTesseractRecognizeResult] = useState<null | Tesseract.RecognizeResult>(null);

  const workerRef = useRef<Tesseract.Worker | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageData(reader.result as string); // capture the uri
      }

      reader.readAsDataURL(file);
    })
  }, [])

  const handleExtract = async () => {
    const worker = workerRef.current;
    console.log('worker:', worker)
    if (!worker || !imageData) {
      console.log('failed to prepare worker or image data')
      return;
    }

    // await worker.load();
    const response = await worker.recognize(imageData);
    setTesseractRecognizeResult(response);
    console.log(response);
  }

  const prepareWorkerRef = async () => {
    workerRef.current = await createWorker('eng', Tesseract.OEM.DEFAULT, {
      logger: message => {
        console.log('message:', message)
        if ('progress' in message) {
          // console.log('progress:', message.progress);
          // console.log('progress:', workerRef);
          setParseResults((prev) => ({ ...prev, progress: message.progress, status: message.status }))
        }
      }
    });
  }

  useEffect(() => {
    prepareWorkerRef();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    }
  }, [])



  let receiptItems: ReceiptItem[] = []

  if (tesseractRecognizeResult) {
    receiptItems = transformTesseractRecognizeResultToReceiptItems(tesseractRecognizeResult)
  }

  return (
    <div className="p-4">
      <h1 className="font-mono font-bold text-2xl">Receipt Parser Demo</h1>
      <div className="grid grid-cols-2">
        <div>
          <FileUpload onDrop={onDrop} />
          <div className='space-x-2 flex my-2'>
            <Button type="button" className='w-full' disabled={!imageData} onClick={() => setImageData(null)}>Clear File</Button>
            <Button type="button" className='w-full' disabled={!imageData || !workerRef.current} onClick={handleExtract}>Extract</Button>
          </div>
          {imageData && <img src={imageData} className='h-72' />}
        </div>
      </div>


      {/* <Card className='h-72'>
        <div className='my-4 w-full flex justify-center'>
          <div className=' flex flex-col space-y-2'>
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </Card> */}



      <p>{parseResults.status.toUpperCase()} |{parseResults.progress * 100}</p>

      {!!tesseractRecognizeResult &&
        <Card>
          <CardHeader>
            <CardTitle>OCR Result</CardTitle>
            <CardDescription>Extracted text from the image</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h2 className='text-xl'>Raw Content</h2>
              <p className='font-mono'>{tesseractRecognizeResult.data.text}</p>
            </div>

            {tesseractRecognizeResult &&
              <ReceiptPreview
                receiptItems={receiptItems}
              />
            }
          </CardContent>
        </Card>
      }

    </div>
  )
}

export default App
