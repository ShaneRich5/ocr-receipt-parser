import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { useDropzone } from 'react-dropzone'
import Tesseract, { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { ReceiptItem } from './lib/interfaces';
import { transformTesseractRecognizeResultToReceiptItems } from './lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


interface ReceiptProps {
  receiptItems: ReceiptItem[]
}

const Receipt: React.FC<ReceiptProps> = ({ receiptItems }) => {
  let individualItems: ReceiptItem[] = []
  let subtotal = 0;
  let tip = 0;
  let total = 0;

  receiptItems.forEach((item) => {
    const itemName = item.name.toLowerCase();

    if (itemName.includes('tip')) {
      tip = item.cost;
    } else if (itemName.includes('subtotal')) {
      subtotal = item.cost;
    } else if (itemName.includes('total')) {
      total = item.cost;
    } else {
      individualItems.push(item);
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt</CardTitle>
        <CardDescription>OCR Results</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-left">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {individualItems.map((item, idx) =>
              <TableRow key={`${idx}-${item.name}`}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-left">${item.cost.toFixed(2)}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-medium">Subtotal</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-left">${subtotal.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tip</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-left">${tip.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-left">${total.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

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

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false })

  let receiptItems: ReceiptItem[] = []

  if (tesseractRecognizeResult) {
    receiptItems = transformTesseractRecognizeResultToReceiptItems(tesseractRecognizeResult)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Dropzone */}
      <div {...getRootProps()} className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input {...getInputProps()} id="dropzone-file" type="file" className="hidden" />
        </label>
      </div>

      {imageData && <img src={imageData} className='h-72' />}

      {/* <Card className='h-72'>
        <div className='my-4 w-full flex justify-center'>
          <div className=' flex flex-col space-y-2'>
            <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </Card> */}

      <div className='space-x-2'>
        <Button type="button" disabled={!imageData} onClick={() => setImageData(null)}>Clear File</Button>
        <Button type="button" disabled={!imageData || !workerRef.current} onClick={handleExtract}>Extract</Button>
      </div>

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
              <Receipt
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
