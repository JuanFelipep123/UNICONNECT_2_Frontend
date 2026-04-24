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
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((att, index) => (
              <TouchableOpacity
                key={att.id || index}
                style={[
                  styles.attachmentPill,
                  isOwnMessage
                    ? styles.ownAttachmentPill
                    : styles.partnerAttachmentPill,
                ]}
                onPress={() => onAttachmentPress(att)}
              >
                <Ionicons
                  name="document-attach-outline"
                  size={16}
                  color={isOwnMessage ? "#FFFFFF" : "#00284D"}
                />
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
              </TouchableOpacity>
            ))}
          </View>
        )}

        {message.content ? (
          <Text style={textStyle}>{message.content}</Text>
        ) : null}

        <Text
          style={[
            styles.timeText,
            isOwnMessage ? styles.ownTimeText : styles.partnerTimeText,
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
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
    maxWidth: "80%",
  },
  partnerBubble: {
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: "80%",
  },
  ownText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },
  partnerText: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  partnerTimeText: {
    color: "#64748B",
  },
  attachmentsContainer: {
    marginBottom: 4,
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  ownAttachmentPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  partnerAttachmentPill: {
    backgroundColor: "#CBD5E1",
  },
  attachmentName: {
    fontSize: 13,
    marginLeft: 6,
    flexShrink: 1,
  },
  ownAttachmentText: {
    color: "#FFFFFF",
  },
  partnerAttachmentText: {
    color: "#00284D",
  },
});
