import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AttachmentButton } from "./AttachmentButton";

interface AttachmentFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

interface Props {
  onSend: (text: string, file?: AttachmentFile) => void;
  isSending: boolean;
}

export const MessageInput: React.FC<Props> = ({ onSend, isSending }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<AttachmentFile | null>(null);

  const handleSend = () => {
    if (text.trim() || file) {
      onSend(text.trim(), file || undefined);
      setText("");
      setFile(null);
    }
  };

  const hasContent = text.trim().length > 0 || file !== null;

  return (
    <View style={styles.wrapper}>
      {file && (
        <View style={styles.attachmentPreview}>
          <Ionicons name="document-attach" size={16} color="#00284D" />
          <Text style={styles.attachmentName} numberOfLines={1}>
            {file.name}
          </Text>
          <TouchableOpacity
            onPress={() => setFile(null)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.container}>
        <AttachmentButton onAttach={setFile} disabled={isSending} />

        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#94A3B8"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!isSending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!hasContent || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!hasContent || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color="#FFFFFF"
              style={styles.sendIcon}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  attachmentName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#0F172A",
  },
  removeButton: {
    marginLeft: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: "#0F172A",
    marginHorizontal: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00284D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2, // alineado con el input de una línea
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  sendIcon: {
    marginLeft: 4, // alinear visualmente el icono de enviar (paper plane)
  },
});
