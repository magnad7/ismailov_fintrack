<!-- pages/chat.vue -->
<script setup>
import { useWebSocket } from "@vueuse/core";
const url = "/_ws"; // aynan shu route

const log = ref([]);
const input = ref("");

const { close, data, open, send, status } = useWebSocket(url, {
  autoConnect: true,
  heartbeat: {
    interval: 10000,
    message: "ping",
    pongTimeout: 2000,
  },
  onConnected: () => log.value.push("✅ connected"),
  onDisconnected: () => log.value.push("❌ disconnected"),
  onError: (e) => log.value.push("⚠️ error: " + (e?.message || e)),
});

watch(data, (d) => {
  console.log(d);
  if (!d) return;
  const s = String(d);

  if (s === "pong") {
    log.value.push("🏓 pong");
    return;
  }
  if (s === "ping") {
    log.value.push("🏓 ping");
    return;
  }

  log.value.push("📨 " + s);
});

function sendMsg() {
  if (!input.value) return;
  send(input.value);
  input.value = "";
}
</script>

<template>
  <div class="page">
    <h1>Settings</h1>

    <div class="p-6 space-y-4">
      <div class="text-sm opacity-70">Status: {{ status }}</div>

      <div class="flex gap-2">
        <input
          v-model="input"
          placeholder="Yozing..."
          class="border px-3 py-2 rounded w-full" />
        <button
          class="px-4 py-2 bg-black text-white rounded"
          @click="sendMsg">
          Yuborish
        </button>
        <button
          class="px-3 py-2 border rounded"
          @click="close()">
          Disconnect
        </button>
        <button
          class="px-3 py-2 border rounded"
          @click="open()">
          Reconnect
        </button>
      </div>

      <pre class="bg-gray-50 p-3 rounded max-h-80 overflow-auto"
        >{{ log.join("\n") }}
      </pre>
    </div>
  </div>
</template>
