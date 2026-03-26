<script setup>
import en from "element-plus/dist/locale/en.mjs";
import ru from "element-plus/dist/locale/ru.mjs";
import uz from "element-plus/dist/locale/uz-uz.mjs";
defineProps({
  activeLanguage: {
    default: "",
    type: String,
  },
  isServer: {
    default: false,
    type: Boolean,
  },
});
const { locale } = useI18n();
</script>

<template>
  <el-config-provider
    :locale="locale === 'uz' ? uz : locale === 'ru' ? ru : en">
    <template v-if="!isServer">
      <client-only>
        <slot />
      </client-only>
    </template>
    <template v-else>
      <slot />
    </template>
  </el-config-provider>
</template>
