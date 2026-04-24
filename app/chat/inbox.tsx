import { Stack } from "expo-router";
import React from "react";
import { InboxScreen } from "../../src/features/chat/screens/InboxScreen";

export default function InboxRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Bandeja de entrada",
          headerStyle: { backgroundColor: "#00284D" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <InboxScreen />
    </>
  );
}
