import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { DataCaptureContext } from "scandit-react-native-datacapture-core";
import { ScanditProvider } from "@/scandit/ScanditContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const IOS_SCANDIT_API_KEY = process.env.EXPO_PUBLIC_IOS_SCANDIT_API_KEY;

console.log("IOS_SCANDIT_API_KEY", IOS_SCANDIT_API_KEY);

export default function RootLayout() {
  const dataCaptureContext = useMemo(() => {
    return DataCaptureContext.forLicenseKey(IOS_SCANDIT_API_KEY ?? "");
  }, []);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ScanditProvider value={dataCaptureContext}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ScanditProvider>
  );
}
