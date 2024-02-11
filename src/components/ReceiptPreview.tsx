import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptItem } from '@/lib/interfaces';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReceiptPreviewProps {
  receiptItems: ReceiptItem[]
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ receiptItems }) => {
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

export default ReceiptPreview