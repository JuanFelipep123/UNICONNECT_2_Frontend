import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ChatScreen } from "../../src/features/chat/screens/ChatScreen";

export default function ChatRoute() {
  const { partnerName } = useLocalSearchParams<{ partnerName: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: partnerName || "Chat",
          headerStyle: { backgroundColor: "#00284D" },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
      <ChatScreen />
    </>
  );
}
