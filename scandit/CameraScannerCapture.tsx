import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, BackHandler } from "react-native";
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureOverlayStyle,
  BarcodeCaptureSession,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
} from "scandit-react-native-datacapture-barcode";
import {
  Camera,
  CameraSettings,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  RectangularViewfinder,
  RectangularViewfinderStyle,
  RectangularViewfinderLineStyle,
  VideoResolution,
  SizeWithUnit,
  NumberWithUnit,
  MeasureUnit,
} from "scandit-react-native-datacapture-core";
import { requestCameraPermissionsIfNeeded } from "./camera-permission-handler";
import { useScanditContext } from "./ScanditContext";
import { PixelRatio } from "react-native";
import { defaultEnabledSymbologies } from "./defaultEnabledSymbologies";

export const CAMERA_TARGET_SCAN_SQUIRCLE_SIZE =
  PixelRatio.getPixelSizeForLayoutSize(180);

interface CameraScannerCaptureProps {
  onBarcodeScanned: (barcode: { symbology: string; data: string }) => void;
  mode?: "multiScan" | "singleScan" | "findSKU";
  enabledSymbologies?: Symbology[];
}

export function CameraScannerCapture({
  onBarcodeScanned,
  mode,
  enabledSymbologies = defaultEnabledSymbologies,
}: CameraScannerCaptureProps) {
  const viewRef = useRef<DataCaptureView>(null);

  const dataCaptureContext = useScanditContext();

  const [camera, setCamera] = useState<Camera | null>(null);
  const [barcodeCaptureMode, setBarcodeCaptureMode] =
    useState<BarcodeCapture | null>(null);
  const [isBarcodeCaptureEnabled, setIsBarcodeCaptureEnabled] = useState(false);
  const [cameraState, setCameraState] = useState(FrameSourceState.Off);

  // Due to a React Native issue with firing the AppState 'change' event on iOS, we want to avoid triggering
  // a startCapture/stopCapture on the scanner twice in a row. We work around this by keeping track of the
  // latest command that was run, and skipping a repeated call for starting or stopping scanning.
  const lastCommand = useRef<string | null>(null);

  useEffect(() => {
    const handleAppStateChangeSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    setupScanning();
    startCapture();
    return () => {
      handleAppStateChangeSubscription.remove();
      stopCapture();
      // dataCaptureContext.dispose();
    };
  }, []);

  useEffect(() => {
    if (camera) {
      camera.switchToDesiredState(cameraState);
    }
  }, [cameraState]);

  useEffect(() => {
    if (barcodeCaptureMode) {
      barcodeCaptureMode.isEnabled = isBarcodeCaptureEnabled;
    }
  }, [isBarcodeCaptureEnabled]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      stopCapture();
    } else {
      startCapture();
    }
  };

  const setupScanning = () => {
    // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
    // default and must be turned on to start streaming frames to the data capture context for recognition.
    const cameraSettings = new CameraSettings();
    cameraSettings.preferredResolution = VideoResolution.FullHD;

    const camera = Camera.withSettings(cameraSettings);
    dataCaptureContext.setFrameSource(camera);
    setCamera(camera);

    // The barcode capturing process is configured through barcode capture settings
    // and are then applied to the barcode capture instance that manages barcode recognition.
    const settings = new BarcodeCaptureSettings();

    // https://docs.scandit.com/5.7/windows/html/5f23c0d1-3048-4b02-01ad-ebd44d636632.htm
    settings.codeDuplicateFilter = -1;

    // The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
    // sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
    // symbologies that your app requires as every additional enabled symbology has an impact on processing times.
    settings.enableSymbologies(enabledSymbologies);

    // Some linear/1d barcode symbologies allow you to encode variable-length data. By default, the Scandit
    // Data Capture SDK only scans barcodes in a certain length range. If your application requires scanning of one
    // of these symbologies, and the length is falling outside the default range, you may need to adjust the "active
    // symbol counts" for this symbology. This is shown in the following few lines of code for one of the
    // variable-length symbologies.
    const symbologySettings = settings.settingsForSymbology(Symbology.Code39);
    symbologySettings.activeSymbolCounts = [
      7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];

    const dataMatrixSettings = settings.settingsForSymbology(
      Symbology.DataMatrix
    );
    dataMatrixSettings.isColorInvertedEnabled = true;

    const qrSettings = settings.settingsForSymbology(Symbology.QR);
    qrSettings.isColorInvertedEnabled = true;

    // Create new barcode capture mode with the settings from above.
    const barcodeCapture = BarcodeCapture.forContext(
      dataCaptureContext,
      settings
    );

    // Register a listener to get informed whenever a new barcode got recognized.
    const barcodeCaptureListener = {
      didScan: (_: BarcodeCapture, session: BarcodeCaptureSession) => {
        const barcode = session.newlyRecognizedBarcodes[0];
        const symbology = new SymbologyDescription(barcode.symbology);

        if (mode !== "multiScan") {
          setIsBarcodeCaptureEnabled(false);
        }

        onBarcodeScanned({
          symbology: symbology.identifier,
          data: barcode.data ?? "",
        });
      },
    };

    // Add the listener to the barcode capture context.
    barcodeCapture.addListener(barcodeCaptureListener);

    // Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
    // the video preview, using the Frame overlay style. This is optional, but recommended for better visual feedback.
    const overlay = BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      barcodeCapture,
      null,
      BarcodeCaptureOverlayStyle.Frame
    );

    const rect = new RectangularViewfinder(
      RectangularViewfinderStyle.Rounded,
      RectangularViewfinderLineStyle.Light
    );

    rect.setSize(
      new SizeWithUnit(
        new NumberWithUnit(CAMERA_TARGET_SCAN_SQUIRCLE_SIZE, MeasureUnit.Pixel),
        new NumberWithUnit(CAMERA_TARGET_SCAN_SQUIRCLE_SIZE, MeasureUnit.Pixel)
      )
    );

    // adds a dimmed background in scope area
    rect.dimming = 0.2;
    overlay.viewfinder = rect;

    viewRef.current?.addOverlay(overlay);
    setBarcodeCaptureMode(barcodeCapture);
  };

  const startCapture = async () => {
    if (lastCommand.current === "startCapture") {
      return;
    }
    lastCommand.current = "startCapture";
    startCamera();
    setIsBarcodeCaptureEnabled(true);
  };

  const stopCapture = () => {
    if (lastCommand.current === "stopCapture") {
      return;
    }
    lastCommand.current = "stopCapture";
    setIsBarcodeCaptureEnabled(false);
    stopCamera();
  };

  const startCamera = () => {
    // Switch camera on to start streaming frames and enable the barcode capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => setCameraState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  };

  const stopCamera = () => {
    if (camera) {
      setCameraState(FrameSourceState.Off);
    }
  };

  return (
    <DataCaptureView
      style={{ flex: 1 }}
      context={dataCaptureContext}
      ref={viewRef}
    />
  );
}
