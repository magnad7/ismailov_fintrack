export interface ChatData {
  avatar: null | string;
  id: number;
  isGroup: boolean;
  isOnline: boolean;
  lastMessage: string;
  name: string;
  time: string;
  unreadCount: number;
}

export interface NotificationItem {
  [key: string]: any;
  approver?: string;
  author?: string;
  created_at?: string;
  employee?: string;
  id?: number | string;
  message?: string;
  order_id?: number;
  order_title?: string;
  priority?: "high" | "low" | "medium";
  read_at?: null | string;
  sender_id?: number;
  time?: string;
  title?: string;
  type: string;
}

export const useNotificationStore = defineStore("notificationStore", () => {
  const { $echo } = useNuxtApp();
  const authStore = useAuthStore();

  const notificationsList = ref<NotificationItem[]>([]);
  const chatList = ref<ChatData[]>([]);
  const visibleNotificationPopup = ref<boolean>(false);
  const count = ref<number>(0);

  let currentChannel: null | string = null;

  const getList = async (): Promise<void> => {
    try {
      const { data } = await GET<{
        chats: ChatData[];
        notifications: NotificationItem[];
        unread_count?: number;
      }>(`notifications`);

      notificationsList.value = data.notifications || [];
      chatList.value = data.chats || [];

      if (data.unread_count !== undefined) {
        count.value = data.unread_count;
      } else if (data.notifications) {
        count.value = data.notifications.filter((n) => !n.read_at).length;
      } else {
        count.value = 0;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (): Promise<void> => {
    try {
      await POST(`notifications/mark-as-read`);
      count.value = 0;
      visibleNotificationPopup.value = false;
      notificationsList.value = [];
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotification = (payload: any): void => {
    const isOrderNotification = [
      "order_accepted",
      "order_approved",
      "order_created",
      "order_declined",
      "order_rejected",
      "target_user_order",
    ].includes(payload?.type);

    const isGeneralNotification =
      !isOrderNotification && payload?.data?.notifications;

    if (isOrderNotification) {
      const { data, message, order_id, sender_id, title, type } = payload;

      count.value++;

      notificationsList.value = [
        {
          message,
          title,
          type,
          ...data,
          order_id: order_id || data?.order_id,
          sender_id,
          time: new Date().toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...notificationsList.value,
      ];

      let toastType = "info";
      if (["order_accepted", "order_approved"].includes(type))
        toastType = "success";
      if (["order_declined", "order_rejected"].includes(type))
        toastType = "warning";

      ElNotification({
        duration: 5000,
        message: message || "Sizda yangi xabar bor",
        onClick: () => {
          visibleNotificationPopup.value = true;
        },
        title: title || "Yangi bildirishnoma",
        type: toastType as any,
      });
    }

    if (isGeneralNotification) {
      const notification = payload.data.notifications;
      const updatedChat = payload.data.updated_chat;
      const { message, title, type } = notification;

      // Logic to sync lists and counts for all general system notifications
      // excluding 'chat_message' if we want to handle it separately
      if (type !== "chat_message") {
        count.value++;
        notificationsList.value = [notification, ...notificationsList.value];
      }

      if (["chat_created", "chat_message", "group_add"].includes(type)) {
        if (updatedChat) {
          const existingIdx = chatList.value.findIndex(
            (c) => c.id === updatedChat.id
          );
          const newChatList = [...chatList.value];
          if (existingIdx !== -1) newChatList[existingIdx] = updatedChat;
          else newChatList.unshift(updatedChat);
          chatList.value = newChatList;
        }
        if (type !== "chat_message") {
          ElNotification({ message, title: title || "Chat", type: "info" });
        }
      } else if (type === "calendar") {
        ElNotification({ message: "Kalendar yangilandi", type: "info" });
      } else if (["general_info", "new_assignment"].includes(type)) {
        ElNotification({ message, title: title || "Ma'lumot", type: "info" });
      } else if (type === "department_created") {
        ElNotification({
          message,
          title: title || "Bildirishnoma",
          type: "info",
        });
      }
    }
  };

  const connect = (): void => {
    if (currentChannel) return;

    const idValue = authStore.myIdValue || "";
    if (!idValue) return;

    currentChannel = `user.${idValue}`;

    $echo
      .join(currentChannel)
      .here((_users: unknown) => {
        void _users;
      })
      .joining((_user: unknown) => {
        void _user;
      })
      .leaving((_user: unknown) => {
        void _user;
      })
      .listen("MessageSent", (_messageText: unknown) => {
        void _messageText;
      })
      .listenForWhisper("typing", (_e: unknown) => {
        void _e;
      });

    $echo
      .private(currentChannel)
      .notification((payload: any) => {
        handleNotification(payload);
      })
      .listen(".ChatUpdated", (_e: unknown) => {
        void _e;
      });
  };

  const disconnect = (): void => {
    if (!currentChannel) return;
    $echo.leave(currentChannel);
    currentChannel = null;
  };

  return {
    chatList,
    connect,
    count,
    disconnect,
    getList,
    markAsRead,
    notificationsList,
    visibleNotificationPopup,
  };
});
