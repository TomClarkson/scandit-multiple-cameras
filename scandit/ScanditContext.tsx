import React from "react";
import { DataCaptureContext } from "scandit-react-native-datacapture-core";

export const ScanditContext = React.createContext<DataCaptureContext | null>(
  null
);

export const ScanditProvider = ScanditContext.Provider;

export function useScanditContext() {
  const context = React.useContext(ScanditContext);
  if (!context) {
    throw new Error("useScanditContext must be used within a ScanditProvider");
  }
  return context;
}
