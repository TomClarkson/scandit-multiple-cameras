import { Symbology } from 'scandit-react-native-datacapture-barcode';

export const codeSymbologies = [
  Symbology.Code11,
  Symbology.Code25,
  Symbology.Code32,
  Symbology.Code39,
  Symbology.Code93,
  Symbology.Code128,
];

export const itemSymbologies = [
  ...codeSymbologies,
  Symbology.QR,
  Symbology.DataMatrix,
];

export const skuSymbologies = [
  Symbology.EAN13UPCA,
  Symbology.UPCE,
  Symbology.EAN8,
];

export const defaultEnabledSymbologies = [
  ...skuSymbologies,
  ...itemSymbologies,
];
