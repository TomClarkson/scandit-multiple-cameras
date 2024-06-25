import {
  Button,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCallback, useState } from "react";
import { CameraScannerCapture } from "@/scandit/CameraScannerCapture";

type ReadBarcode = {
  symbology: string;
  data: string;
};

export default function HomeScreen() {
  const [isSingleScanOpen, setIsSingleScanOpen] = useState(false);
  const [isMultiScanOpen, setIsMultiScanOpen] = useState(false);

  const [readBarcodes, setReadBarcodes] = useState<ReadBarcode[]>([]);

  // add camera input
  const handleBarcodeScanned = useCallback((code: ReadBarcode) => {
    setReadBarcodes((prev) => [...prev, code]);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
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
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity
            disabled={isMultiScanOpen}
            onPress={() => setIsSingleScanOpen((o) => !o)}
            style={{
              backgroundColor: "blue",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white" }}>
              {isSingleScanOpen ? "Close Single Scan" : "Open Single Scan"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isSingleScanOpen}
            onPress={() => setIsMultiScanOpen((o) => !o)}
            style={{
              backgroundColor: "yellow",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text>
              {isMultiScanOpen ? "Close Multi Scan" : "Open Multi Scan"}
            </Text>
          </TouchableOpacity>
        </View>

        {isSingleScanOpen && (
          <CameraScannerCapture
            onBarcodeScanned={handleBarcodeScanned}
            mode="singleScan"
          />
        )}
        {isMultiScanOpen && (
          <CameraScannerCapture
            onBarcodeScanned={handleBarcodeScanned}
            mode="multiScan"
          />
        )}
      </View>
    </SafeAreaView>
  );
}
