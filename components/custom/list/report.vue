<script setup>
const loading = defineModel("loading", { type: [Boolean] });
const phrase = defineModel("phrase", { type: [String] });
const column = defineModel("column", { type: [String] });
const emit = defineEmits(["submit"]);
const authStore = useAuthStore();
const { data: contractsList } = await useAsyncData("custom_contract_list", () =>
  GET(`${authStore.role}/requirements/get-e-dist-columns`)
);

// onMounted(async () => {
//   const { data: contractsList } = await GET(
//     `${role.value}/requirements/get-e-dist-columns`
//   );
// });
</script>

<template>
  <div class="bg-white medium d-flex mb-30">
    <el-input
      v-model="phrase"
      class="w-full mr-20"
      placeholder="Поиск"
      suffix-icon="el-icon-search"
      :disabled="loading || !column"
      @keyup.enter="emit('submit')" />
    <client-only>
      <el-select
        v-model="column"
        placeholder="Здания">
        <el-option
          label="Не выбрано"
          value="" />
        <el-option
          v-for="(item, index) in Object.keys(contractsList.data)"
          :key="index"
          :label="contractsList.data[item]"
          :value="item" />
      </el-select>
    </client-only>
    <el-button
      :loading="loading && !phrase"
      :disabled="loading && !phrase"
      type="primary"
      class="ml-20"
      @click.prevent="emit('submit')">
      <Svg
        class="mr-0"
        name="search" />
    </el-button>
  </div>
</template>
