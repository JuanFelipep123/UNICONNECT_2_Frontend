import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChatAttachment, ChatMessage } from "../types/chat.types";

interface Props {
  message: ChatMessage;
  isOwnMessage: boolean;
  onAttachmentPress: (attachment: ChatAttachment) => void;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isOwnMessage,
  onAttachmentPress,
}) => {
  const containerStyle = isOwnMessage ? styles.ownBubble : styles.partnerBubble;
  const textStyle = isOwnMessage ? styles.ownText : styles.partnerText;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.partnerContainer,
      ]}
    >
      <View style={containerStyle}>
        {message.content ? (
          <Text style={textStyle}>{message.content}</Text>
        ) : null}

        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((att, index) => {
              const mbSize = (att.fileSize / (1024 * 1024)).toFixed(1);
              const ext =
                att.fileName.split(".").pop()?.toUpperCase() || "FILE";
              return (
                <TouchableOpacity
                  key={att.id || index}
                  style={[
                    styles.attachmentCard,
                    isOwnMessage
                      ? styles.ownAttachmentCard
                      : styles.partnerAttachmentCard,
                  ]}
                  onPress={() => onAttachmentPress(att)}
                >
                  <View style={styles.attachmentIconBox}>
                    <Ionicons name="document-text" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text
                      style={[
                        styles.attachmentName,
                        isOwnMessage
                          ? styles.ownAttachmentText
                          : styles.partnerAttachmentText,
                      ]}
                      numberOfLines={1}
                    >
                      {att.fileName}
                    </Text>
                    <Text style={styles.attachmentSubText}>
                      {mbSize} MB • {ext}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.timeContainer}>
          <Text
            style={[
              styles.timeText,
              isOwnMessage ? styles.ownTimeText : styles.partnerTimeText,
            ]}
          >
            {time}
          </Text>
          {isOwnMessage && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color="#60A5FA"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: "row",
  },
  ownContainer: {
    justifyContent: "flex-end",
  },
  partnerContainer: {
    justifyContent: "flex-start",
  },
  ownBubble: {
    backgroundColor: "#00284D",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  partnerBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ownText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  partnerText: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
  },
  ownTimeText: {
    color: "rgba(255,255,255,0.6)",
  },
  partnerTimeText: {
    color: "#94A3B8",
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  ownAttachmentCard: {
    backgroundColor: "#F1F5F9",
  },
  partnerAttachmentCard: {
    backgroundColor: "#F1F5F9",
  },
  attachmentIconBox: {
    backgroundColor: "#FCA5A5", // Soft red/pink for the icon back, matching the image reference
    height: 40,
    width: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
  attachmentSubText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  ownAttachmentText: {
    color: "#0F172A",
  },
  partnerAttachmentText: {
    color: "#0F172A",
  },
});
