import { useCallback, useEffect, useRef, useState } from 'react';
import Tesseract, { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptItem } from './lib/interfaces';
import { transformTesseractRecognizeResultToReceiptItems } from './lib/utils';
import ReceiptPreview from '@/components/ReceiptPreview';
import FileUpload from '@/components/FileUpload';
import { Badge } from "@/components/ui/badge"
import OcrStatus from '@/components/OcrStatus';
import OcrRawData from './components/OcrRawData';
import ReceiptLoading from './components/ReceiptLoading';
import ImagePreview from './components/ImagePreview';

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

  const isTesseractLoading = parseResults.status === 'loading tesseract core'
    || parseResults.status === 'loading language traineddata'
    || (parseResults.status === 'initializing tesseract' && parseResults.progress < 1);

  const isReceiptLoading = parseResults.status === 'recognizing text' && parseResults.progress < 1;
  const hasReceiptLoaded = parseResults.status === 'recognizing text' && parseResults.progress === 1;

  return (
    <div className="p-4">
      <div className='flex space-x-2'>
        <h1 className="font-mono font-bold text-2xl">Receipt Parser Demo</h1>
        <span>
          {(isTesseractLoading || !workerRef.current)
            ? <Badge variant="destructive">Loading Tesseract</Badge>
            : <Badge variant="secondary">Tesseract Loaded</Badge>
          }
        </span>
      </div>
      <div className="grid grid-cols-2 mt-2 gap-4">
        <div className='col-span-2 md:col-span-1'>
          {!imageData && <FileUpload onDrop={onDrop} />}
          <div className='space-x-2 flex mb-4'>
            <Button type="button" className='w-full' disabled={!imageData} onClick={() => setImageData(null)}>Clear File</Button>
            <Button type="button" className='w-full' disabled={!imageData || !workerRef.current} onClick={handleExtract}>Extract</Button>
          </div>
          {imageData && <ImagePreview src={imageData} />}
        </div>
        <div className='col-span-2 md:col-span-1 space-y-4'>
          <OcrStatus status={parseResults.status} progress={parseResults.progress} />
          {isReceiptLoading && <ReceiptLoading />}
          {(hasReceiptLoaded && tesseractRecognizeResult) &&
            <Tabs defaultValue="formatted-receipt" className="w-full">
              <TabsList className='w-full'>
                <TabsTrigger value="formatted-receipt" className='w-full'>Formatted Receipt</TabsTrigger>
                <TabsTrigger value="raw-data" className='w-full'>Raw Data</TabsTrigger>
              </TabsList>
              <TabsContent value="formatted-receipt">
                <ReceiptPreview receiptItems={receiptItems} />
              </TabsContent>
              <TabsContent value="raw-data">
                <OcrRawData content={tesseractRecognizeResult.data.text} />
              </TabsContent>
            </Tabs>
          }
        </div>
      </div>
    </div>
  )
}

export default App
