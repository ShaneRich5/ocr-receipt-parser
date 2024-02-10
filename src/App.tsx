import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Dropzone, { useDropzone } from 'react-dropzone'
import Tesseract, { createWorker } from 'tesseract.js';

function App() {
  const [imageData, setImageData] = useState<null | string>(null)
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('idle');
  const [ocrResult, setOcrResult] = useState('');

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
    if (!worker) return;

    // await worker.load();
    const response = await worker.recognize(imageData);
    setOcrResult(response.data.text);
    console.log(response);
  }

  const prepareWorkerRef = async () => {
    workerRef.current = await createWorker('eng', Tesseract.OEM.DEFAULT, {
      logger: message => {
        if ('progress' in message) {
          console.log('progress:', message.progress);
          console.log('progress:', workerRef);
          setProgress(message.progress);
          setProgressLabel(message.progress == 1 ? 'Done' : message.status);
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

  return (
    <div>
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

      {imageData && <img src={imageData}/>}

      <button type="button" disabled={!imageData || !workerRef.current} onClick={handleExtract}>Extract</button>
      <p>{progressLabel.toUpperCase()} |{progress * 100}</p>

      {!!ocrResult &&
        <div>
          <h2 className='text-xl'>RESULT</h2>
          <p className='font-mono'>{ocrResult}</p>
        </div>
      }

      {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone> */}


    </div>
  )
}

export default App
