import { Button, SafeAreaView, View } from "react-native";

import { Scanner } from "@/scandit/Scanner";
import { useState } from "react";

export default function HomeScreen() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "pink" }}>
        <Button
          onPress={() => setIsOpen((o) => !o)}
          title={isOpen ? "Close Camera" : "Open Camera"}
        />
        {isOpen && <Scanner />}
      </View>
    </SafeAreaView>
  );
}
