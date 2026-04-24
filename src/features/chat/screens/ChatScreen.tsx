import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import chatApi from "../../../services/chatApi";
import { MessageBubble } from "../components/MessageBubble";
import { MessageInput } from "../components/MessageInput";
import { useChat } from "../hooks/useChat";

export const ChatScreen: React.FC = () => {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
    partnerName: string;
  }>();
  const {
    messages,
    loadingMessages,
    loadingMore,
    error,
    loadMoreMessages,
    sendMessage,
    uploadAndSendAttachment,
    userId,
  } = useChat(conversationId);
  const [isSending, setIsSending] = useState(false);
  const headerHeight = useHeaderHeight();

  const handleSend = async (content?: string, file?: any) => {
    if (!conversationId) return;
    setIsSending(true);
    try {
      if (file) {
        await uploadAndSendAttachment(
          conversationId,
          file.uri,
          file.name,
          file.mimeType,
          file.size,
        );
      } else if (content) {
        await sendMessage(conversationId, content);
      }
    } catch (e) {
      console.error("Failed to send:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentPress = async (attachment: any) => {
    try {
      const response = await chatApi.get(
        `/api/attachments/dm/${attachment.id}/url`,
      );
      if (response.data.url) {
        await WebBrowser.openBrowserAsync(response.data.url);
      }
    } catch (e) {
      console.error("Failed to open attachment:", e);
    }
  };

  const handleEndReached = () => {
    if (conversationId && !loadingMore && !loadingMessages) {
      loadMoreMessages(conversationId);
    }
  };

  const Container = KeyboardAvoidingView;
  const containerProps = {
    behavior:
      Platform.OS === "ios" ? ("padding" as const) : ("padding" as const),
    keyboardVerticalOffset: headerHeight,
  };

  return (
    <Container style={styles.container} {...containerProps}>
      {loadingMessages && messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00284D" />
        </View>
      ) : error && messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => String(item.id || index)}
          // Assuming messages array: index 0 is newest (inverted list)
          inverted
          shouldRasterizeIOS={true}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwnMessage={item.senderId === userId}
              onAttachmentPress={handleAttachmentPress}
            />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
                size="small"
                color="#00284D"
              />
            ) : null
          }
        />
      )}
      <MessageInput onSend={handleSend} isSending={isSending} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
  },
  loadingMore: {
    marginVertical: 16,
  },
});
