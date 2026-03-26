import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Echo: any;
    Pusher: any;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  window.Pusher = Pusher;

  const echo = new Echo({
    authorizer: (channel: any) => {
      return {
        authorize: (socketId: string, callback: any) => {
          $fetch(`${config.public.apiBase}broadcasting/auth`, {
            body: {
              channel_name: channel.name,
              socket_id: socketId,
            },
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authStore.access}`,
            },
            method: "POST",
          })
            .then((response) => {
              callback(false, response);
            })
            .catch((error) => {
              callback(true, error);
            });
        },
      };
    },
    broadcaster: "reverb",
    enabledTransports: ["ws"],
    forceTLS: false,
    key: config.public.reverbKey as string,
    wsHost: config.public.reverbHost as string,
    wsPort: Number(config.public.reverbPort),

    wssPort: Number(config.public.reverbPort),
  });

  // Butun ilova bo'ylab foydalanish uchun provide qilamiz
  return {
    provide: {
      echo: echo,
    },
  };
});
