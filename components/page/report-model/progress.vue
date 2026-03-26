<script setup>
defineProps({
  detailData: {
    default: () => ({}),
    type: Object,
  },
});
</script>

<template>
  <Provider :is-server="true">
    <h4
      style="
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 700;
        color: #2b8bd1;
      ">
      Ежедневный отчет по прогрессу
    </h4>
    <div class="d-flex mb-8">
      <span class="mb-12">
        Участок:
        <b style="color: #2b8bd1">{{ detailData.plot }}</b>
      </span>
      <span class="mb-12 ml-20">
        Смена:
        <b style="color: #2b8bd1">{{ detailData.changeModel }}</b>
      </span>
    </div>
    <el-table
      :data="detailData.techniqueList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="technique"
        label="Техника"
        show-overflow-tooltip />
      <el-table-column
        prop="techniqueCount"
        label="Количество" />
      <el-table-column
        prop="worker"
        label="Специальность рабочего" />
      <el-table-column
        prop="workerCount"
        label="Количество" />
    </el-table>

    <h4
      style="
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 700;
        color: #2b8bd1;
      ">
      План СМР на следующий день
    </h4>

    <el-table
      :data="detailData.taskList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="foreman"
        label="Ответственный бригадир"
        show-overflow-tooltip
        width="300" />
      <el-table-column
        prop="job_title"
        label="Наименование рабочего"
        width="200" />
      <el-table-column
        prop="design"
        label="Конструкция"
        width="200" />
      <el-table-column
        prop="axis"
        label="Ось"
        width="200" />
      <el-table-column
        prop="unit"
        label="Ед.изм"
        width="200" />
      <el-table-column
        prop="volume"
        label="Выполненный объем"
        width="200" />
      <el-table-column
        prop="number_people"
        label="Кол-во"
        width="200" />
    </el-table>
  </Provider>
</template>
