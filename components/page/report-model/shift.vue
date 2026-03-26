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
      Детали
    </h4>
    <div class="d-flex mb-8">
      <span class="mb-12">
        Unit №:
        <b style="color: #2b8bd1">{{ detailData.plot }}</b>
      </span>
    </div>
    <el-table
      :data="detailData.detailList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="part_band"
        label="Марка детали"
        show-overflow-tooltip />
      <el-table-column
        prop="weight"
        label="Масса" />
      <el-table-column
        prop="name_material"
        label="Название материала" />
      <el-table-column
        prop="count"
        label="Количество" />
      <el-table-column
        prop="altitude_mark"
        label="Высотная отметка" />
      <el-table-column
        prop="x_y"
        label="Х/Y" />
    </el-table>

    <h4
      style="
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 700;
        color: #2b8bd1;
      ">
      Персонал
    </h4>
    <el-table
      :data="detailData.staffList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="name"
        label="Наименование"
        show-overflow-tooltip />
      <el-table-column
        prop="unit"
        label="Ед.изм" />
      <el-table-column
        prop="count"
        label="Количество" />
      <el-table-column
        prop="note"
        label="Примечание" />
    </el-table>

    <h4
      style="
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 700;
        color: #2b8bd1;
      ">
      Техника
    </h4>
    <el-table
      :data="detailData.techniqueList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="name"
        label="Наименование"
        show-overflow-tooltip />
      <el-table-column
        prop="unit"
        label="Ед.изм" />
      <el-table-column
        prop="count"
        label="Количество" />
      <el-table-column
        prop="note"
        label="Примечание" />
    </el-table>
  </Provider>
</template>
