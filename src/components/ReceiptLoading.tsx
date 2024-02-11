import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReceiptLoading = () => (
  <Card>
    <CardHeader>
      <CardTitle><Skeleton className="h-6 w-[130px] bg-slate-200" /></CardTitle>
      <CardTitle><Skeleton className="h-4 w-[230px] bg-slate-200" /></CardTitle>
    </CardHeader>
    <CardContent className='space-y-2'>
      <Skeleton className="h-4 w-full bg-slate-200" />
      <Skeleton className="h-4 w-full bg-slate-200" />
      <Skeleton className="h-4 w-full bg-slate-200" />
    </CardContent>
  </Card>
)

export default ReceiptLoading