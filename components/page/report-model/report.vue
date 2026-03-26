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
    <template
      v-for="(table, index) in detailData.workingTypeReport"
      :key="index">
      <span class="mb-12 d-block">
        Номер линии:
        <b style="color: #2b8bd1">{{ table.title }}</b>
      </span>
      <el-table
        :data="table.data"
        highlight-current-row
        stripe
        border
        class="mb-40">
        <el-table-column
          fixed
          prop="drawing_name"
          label="Наименование чертежа"
          show-overflow-tooltip
          width="300" />
        <el-table-column
          prop="revision"
          label="Ревизия"
          width="200" />
        <el-table-column
          prop="sheet_number"
          label="Лист №"
          width="200" />
        <el-table-column
          prop="area_f"
          label="Площадь F"
          width="200" />
        <el-table-column
          prop="joint_number"
          label="Стык №"
          width="200" />
        <el-table-column
          prop="material_1"
          label="Материал 1"
          width="200" />
        <el-table-column
          prop="material_2"
          label="Материал 2"
          width="200" />
        <el-table-column
          prop="diameter"
          label="Диаметр (mm)"
          width="200" />
        <el-table-column
          prop="thickness"
          label="Толщина (mm)"
          width="200" />
        <el-table-column
          prop="brigadier"
          label="Клеймо бригодира"
          width="300" />
        <el-table-column
          prop="welding_date"
          label="Дата сварки"
          width="200" />
        <el-table-column
          prop="welder_1"
          label="Welder 1"
          width="200" />
        <el-table-column
          prop="welder_2"
          label="Welder 2"
          width="200" />
        <el-table-column
          prop="remarks"
          label="Remarks"
          width="200" />
      </el-table>
    </template>
  </Provider>
</template>
