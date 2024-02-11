import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalize } from '../lib/utils';

interface OcrStatusProps {
  status: string
  progress: number
}

const OcrStatus: React.FC<OcrStatusProps> = ({ status, progress }) => (
  <Card>
    <CardHeader>
      <CardTitle>OCR Status</CardTitle>
      <CardDescription>Current status of the OCR process</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='flex flex-col space-y-2'>
        <p>Status: {capitalize(status)}</p>
        <p>Progress: {(progress * 100).toFixed(0)}%</p>
      </div>
    </CardContent>
  </Card>
)

export default OcrStatus
