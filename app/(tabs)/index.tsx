import { Button, SafeAreaView, Text, View } from "react-native";

import { useCallback, useState } from "react";
import { CameraScannerCapture } from "@/scandit/CameraScannerCapture";

type ReadBarcode = {
  symbology: string;
  data: string;
};

export default function HomeScreen() {
  const [isOpen, setIsOpen] = useState(false);

  const [readBarcodes, setReadBarcodes] = useState<ReadBarcode[]>([]);

  // add camera input
  const handleBarcodeScanned = useCallback((code: ReadBarcode) => {
    setReadBarcodes((prev) => [...prev, code]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "pink" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20 }}>Barcodes</Text>
          <Button onPress={() => setReadBarcodes([])} title="Clear" />
        </View>
        <View>
          {readBarcodes.map((barcode) => (
            <Text key={barcode.data}>
              {barcode.symbology} - {barcode.data}
            </Text>
          ))}
        </View>

        <Button
          onPress={() => setIsOpen((o) => !o)}
          title={isOpen ? "Close Camera" : "Open Camera"}
        />
        {isOpen && (
          <CameraScannerCapture onBarcodeScanned={handleBarcodeScanned} />
        )}
      </View>
    </SafeAreaView>
  );
}
