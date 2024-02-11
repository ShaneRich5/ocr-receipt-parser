import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ReceiptItem } from "./interfaces"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// simple implementation of a parser for the tesseract recognize result
export const transformTesseractRecognizeResultToReceiptItems = (result: Tesseract.RecognizeResult): ReceiptItem[] => {
  const currencyRegex = /(?<=\$)\d+(\.\d+)?/g;
  const nameRegex = /[^|$0-9.-]+/g;
  const quantityRegex = /^\d+/g;

  return result.data.lines.map((line, index) => {
    const cost = line.text.match(currencyRegex)
    const name = line.text.match(nameRegex)
    const quantity = line.text.match(quantityRegex)

    console.log('cost:', cost, 'name:', name, 'quantity:', quantity, 'original:', line.text)

    return {
      cost: cost,
      name: name,
      quantity: quantity,
    }
  })
    .filter(r => r.cost !== null && r.name !== null)
    .map(r => {
      let formattedCost = parseFloat(r.cost?.[0] ?? '0');
      let formattedName = r.name?.[0] ?? '0';
      let formattedQuantity = parseInt(r.quantity?.[0] ?? '1');

      if (isNaN(formattedCost)) {
        formattedCost = 0;
      }

      if (isNaN(formattedQuantity)) {
        formattedQuantity = 1;
      }

      return {
        cost: formattedCost,
        name: formattedName,
        quantity: formattedQuantity
      }
    })
}