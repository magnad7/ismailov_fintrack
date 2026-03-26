<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    blurPx?: number; // qancha xiralashtirish
    dimOpacity?: number; // fonni dim qilish darajasi
    isEmpty?: boolean;
    loading?: boolean;
    rounded?: string; // masalan: "12px" yoki "1rem"
  }>(),
  {
    blurPx: 6,
    dimOpacity: 0.06,
    isEmpty: false,
    rounded: "12px",
  }
);
</script>

<template>
  <!-- Root: slot o‘lchamini saqlash uchun relative konteyner -->
  <div
    class="lb-root"
    :style="{ borderRadius: rounded }"
    :aria-busy="props.loading ? 'true' : 'false'">
    <!-- Kontent (blur bo‘ladigan qism) -->
    <div
      class="lb-content"
      :class="{ 'is-loading': props.loading }"
      :style="{
        filter: props.loading ? `blur(${blurPx}px)` : 'none',
        pointerEvents: props.loading ? 'none' : 'auto',
      }">
      <template v-if="!props.loading && !props.isEmpty">
        <slot />
      </template>

      <el-empty
        v-if="!props.loading && props.isEmpty"
        description="Данные не найдены" />
    </div>

    <!-- Slot o‘lchamida yarim shaffof qatlam + spinner -->
    <transition name="lb-fade">
      <div
        v-if="props.loading"
        class="lb-overlay"
        :style="{
          borderRadius: rounded,
          backgroundColor: `rgba(0,0,0,${dimOpacity})`,
        }">
        <div
          class="lb-spinner"
          role="status"
          aria-label="Yuklanmoqda">
          <!-- Pastel/monoxrom SVG spinner -->
          <svg
            viewBox="0 0 50 50"
            class="lb-svg">
            <circle
              class="lb-track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="4" />
            <circle
              class="lb-head"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke-width="4" />
          </svg>
          <span class="lb-text">Yuklanmoqda…</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Root konteyner: slot o‘lchami bo‘yicha joylashadi */
.lb-root {
  position: relative;
  display: block;
  isolation: isolate; /* overlay z-indexi xavfsiz ishlashi uchun */
}

/* Kontent: loading paytida biroz “soft” effekt */
.lb-content {
  min-height: 200px;
  transition:
    filter 220ms ease,
    transform 220ms ease,
    opacity 220ms ease;

  /* max-width: 100%; */
}

.lb-content.is-loading {
  opacity: 0.98;
  transform: translateZ(0); /* repaint optimizatsiya */
}

/* Overlay: slot hududini to‘liq qoplaydi, lekin ekran emas */
.lb-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;

  /* oq-qora UI uchun: engil dim + shisha hissi */
  backdrop-filter: saturate(1.1) blur(0.5px);
}

/* Spinner konteyneri */
.lb-spinner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  user-select: none;
}

/* SVG spinner: monoxrom (oq-qora UIga mos) */
.lb-svg {
  width: 40px;
  height: 40px;
}

.lb-track {
  opacity: 0.35;
  stroke: #c9c9c9; /* och kulrang (light mode/monoxrom) */
}

.lb-head {
  stroke: #111; /* qora */
  stroke-linecap: round;
  stroke-dasharray: 90;
  stroke-dashoffset: 60;
  transform-origin: 50% 50%;
  animation:
    lb-rotate 1s linear infinite,
    lb-dash 1.2s ease-in-out infinite;
}

/* Matn: ixcham va neytral */
.lb-text {
  font-size: 12px;
  color: #111;
  letter-spacing: 0.02em;
  opacity: 0.9;
}

/* Fade in/out overlay */
.lb-fade-enter-active,
.lb-fade-leave-active {
  transition: opacity 160ms ease;
}

.lb-fade-enter-from,
.lb-fade-leave-to {
  opacity: 0;
}

/* Animatsiyalar */
@keyframes lb-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes lb-dash {
  0% {
    stroke-dashoffset: 95;
  }

  50% {
    stroke-dashoffset: 20;
  }

  100% {
    stroke-dashoffset: 95;
  }
}

/* Motionga sezgir foydalanuvchilar uchun: animatsiyani kamaytirish */
@media (prefers-reduced-motion: reduce) {
  .lb-content {
    transition: none;
  }

  .lb-fade-enter-active,
  .lb-fade-leave-active {
    transition: none;
  }

  .lb-head {
    animation: lb-rotate 1.4s linear infinite;
  }
}
</style>
