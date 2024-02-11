import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OcrRawDataProps {
  content: string
}

const OcrRawData: React.FC<OcrRawDataProps> = ({ content }) => (
  <Card>
    <CardHeader>
      <CardTitle>OCR Result</CardTitle>
      <CardDescription>Extracted text from the image</CardDescription>
    </CardHeader>
    <CardContent>
      <div>
        <h2 className='text-xl'>Raw Content</h2>
        <p className='font-mono'>{content}</p>
      </div>
    </CardContent>
  </Card>
)

export default OcrRawData