// server/routes/_ws.ts
export default defineWebSocketHandler({
  close(peer, event) {
    console.log("[ws] close", peer.id, event?.code);
  },

  error(peer, error) {
    console.log("[ws] error", peer.id, error?.message);
  },

  message(peer, message) {
    const text = message.toString();
    console.log("[ws] message", peer.id, text);

    if (text === "ping") {
      peer.send("pong");
      return;
    }

    peer.send(`echo: ${text}`);
  },

  open(peer) {
    console.log("[ws] open", peer.id);
    peer.send("hello from server");
  },
});
