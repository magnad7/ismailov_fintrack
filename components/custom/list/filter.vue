<script setup>
const loading = defineModel("loading", { type: [Boolean] });
const emit = defineEmits(["submit"]);
const form = reactive({
  author: null,
  end_date: null,
  start_date: null,
  type: null,
});
const shortcuts = [
  {
    text: "Last week",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];
</script>

<template>
  <div class="bg-white medium d-flex mb-30">
    <Provider>
      <el-date-picker
        v-model="form.end_date"
        class="mr-20"
        type="daterange"
        unlink-panels
        range-separator="До"
        start-placeholder="Дата начала"
        end-placeholder="Дата окончания"
        :shortcuts="shortcuts" />
    </Provider>
    <client-only>
      <el-select
        v-model="form.type"
        class="mr-20"
        placeholder="Тип документа">
        <el-option
          label="Акт 1"
          value="Акт 1" />
        <el-option
          label="Акт 2"
          value="Акт 2" />
      </el-select>
    </client-only>
    <el-input
      v-model="form.author"
      class="w-full"
      placeholder="Автор"
      suffix-icon="el-icon-search"
      @keyup.enter="emit('submit')" />
    <el-button
      :loading="loading"
      type="primary"
      class="ml-20"
      @click.prevent="emit('submit')">
      <Svg
        class="mr-0"
        name="search" />
    </el-button>
  </div>
</template>
