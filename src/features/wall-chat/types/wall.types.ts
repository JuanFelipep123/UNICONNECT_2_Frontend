export interface WallPostAttachment {
  id?: string;
  postId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath?: string;
  uploadedAt?: string;
}

export interface WallPost {
  id: string;
  groupId: string;
  senderId: string;
  content?: string;
  createdAt: string;
  attachments?: WallPostAttachment[];
}

export interface WallLastPost {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface WallInboxEntry {
  groupId: string;
  groupName: string;
  lastPost: WallLastPost | null;
}
