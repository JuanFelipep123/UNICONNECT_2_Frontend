import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useChatStore } from "../../../store/chatStore";
import { ConversationItem } from "../components/ConversationItem";

export const InboxScreen: React.FC = () => {
  const router = useRouter();
  const { conversations, loadingConversations, loadConversations, error } =
    useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleRefresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const handlePressConversation = (
    conversationId: string,
    partnerName?: string,
    partnerAvatar?: string,
  ) => {
    router.push({
      pathname: `/chat/${conversationId}` as any,
      params: {
        partnerName: partnerName || "Usuario",
        partnerAvatar: partnerAvatar || "",
      },
    });
  };

  if (loadingConversations && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00284D" />
        <Text style={styles.stateText}>Cargando mensajes...</Text>
      </View>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#94A3B8" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!loadingConversations && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="chatbox-ellipses-outline" size={64} color="#94A3B8" />
        <Text style={styles.stateText}>No tienes conversaciones activas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() =>
              handlePressConversation(
                item.id,
                item.otherParticipant?.name,
                item.otherParticipant?.avatarUrl,
              )
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loadingConversations}
            onRefresh={handleRefresh}
            tintColor="#00284D"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
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
    backgroundColor: "#F8FAFC",
    padding: 32,
  },
  stateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
});
