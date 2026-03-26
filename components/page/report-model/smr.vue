<script setup>
const props = defineProps({
  detailData: {
    default: () => ({}),
    type: Object,
  },
});
const customList = ref([]);

customList.value = [
  {
    peopleCount: props.detailData?.techniqueList.worker_pro,
    title: "ИТР(Инженерно-технические работники)",
  },
  {
    peopleCount: props.detailData.techniqueList.worker,
    title: "Рабочие",
  },
];
</script>

<template>
  <Provider :is-server="true">
    <template
      v-for="(table, index) in detailData.workingType"
      :key="index">
      <span class="mb-12 d-block">
        Вид работ:
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
          show-overflow-tooltip />
        <el-table-column
          prop="revision"
          label="Ревизия" />
        <el-table-column
          prop="unit"
          label="Ед.изм" />
        <el-table-column
          prop="count"
          label="Кол-во" />
        <el-table-column
          prop="volume"
          label="Объем" />
        <el-table-column
          prop="count_workers"
          label="Кол-во рабочих" />
      </el-table>
    </template>

    <h4 style="font-size: 22px; font-weight: 700; color: #2b8bd1">
      План СМР на следующий день
    </h4>
    <el-table
      :data="detailData.planSmrList"
      highlight-current-row
      stripe
      border
      class="mb-40">
      <el-table-column
        fixed
        prop="number_index"
        label="№ по ГП / пикет"
        show-overflow-tooltip />
      <el-table-column
        prop="name"
        label="Наименование выполненных СМР" />
      <el-table-column
        prop="unit"
        label="Ед.изм" />
      <el-table-column
        prop="count"
        label="Кол-во" />
      <el-table-column
        prop="date"
        label="Время инспекции" />
      <el-table-column
        prop="note"
        label="Примечание" />
    </el-table>
  </Provider>

  <el-row
    class="gap-20 mb-40"
    :gutter="20">
    <el-col
      :xs="24"
      :md="12">
      <h4 style="font-size: 22px; font-weight: 700; color: #2b8bd1">
        Персонал
      </h4>
      <el-table
        :data="customList"
        highlight-current-row
        stripe
        border>
        <el-table-column
          prop="title"
          label="Количество задействованных работников">
          <template #default="{ row }">
            <div class="d-flex between">
              {{ row.title }}
              <el-tag type="primary">{{ row.peopleCount }}</el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-col>

    <el-col
      :xs="24"
      :md="12">
      <h4 style="font-size: 22px; font-weight: 700; color: #2b8bd1">Техника</h4>
      <el-table
        :data="detailData.techniqueList.data"
        highlight-current-row
        stripe
        border>
        <el-table-column
          prop="number_index"
          label="№ по ГП / пикет" />
        <el-table-column
          prop="unit"
          label="Ед.изм" />
        <el-table-column
          prop="count"
          label="Кол-во" />
      </el-table>
    </el-col>
  </el-row>

  <div class="page-report-view-area">
    <div class="page-report-view-icon">
      <svg
        width="25"
        height="23"
        viewBox="0 0 25 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.4999 13.3126V7.87509M3.76185 21.4688H21.238C22.6119 21.4688 23.4855 20.0007 22.8321 18.7927L14.094 2.66144C13.408 1.39541 11.5919 1.39541 10.9058 2.66144L2.16867 18.7927C1.51345 20.0007 2.38798 21.4688 3.76185 21.4688Z"
          stroke="#F54A00"
          stroke-width="2"
          stroke-linecap="round" />
        <mask
          id="mask0_264_2721"
          style="mask-type: luminance"
          maskUnits="userSpaceOnUse"
          x="11"
          y="15"
          width="3"
          height="3">
          <path
            d="M13.8594 16.4844C13.8594 16.8449 13.7162 17.1907 13.4612 17.4456C13.2063 17.7005 12.8605 17.8438 12.5 17.8438C12.1395 17.8438 11.7937 17.7005 11.5388 17.4456C11.2838 17.1907 11.1406 16.8449 11.1406 16.4844C11.1406 16.1238 11.2838 15.7781 11.5388 15.5232C11.7937 15.2682 12.1395 15.125 12.5 15.125C12.8605 15.125 13.2063 15.2682 13.4612 15.5232C13.7162 15.7781 13.8594 16.1238 13.8594 16.4844Z"
            fill="white" />
        </mask>
        <g mask="url(#mask0_264_2721)">
          <path
            d="M13.8594 16.4844C13.8594 16.8449 13.7162 17.1907 13.4612 17.4456C13.2063 17.7005 12.8605 17.8438 12.5 17.8438C12.1395 17.8438 11.7937 17.7005 11.5388 17.4456C11.2838 17.1907 11.1406 16.8449 11.1406 16.4844C11.1406 16.1238 11.2838 15.7781 11.5388 15.5232C11.7937 15.2682 12.1395 15.125 12.5 15.125C12.8605 15.125 13.2063 15.2682 13.4612 15.5232C13.7162 15.7781 13.8594 16.1238 13.8594 16.4844Z"
            fill="#F54A00"
            stroke="#F54A00" />
        </g>
      </svg>
    </div>
    <div class="page-report-view-info">
      <h4 class="mb-8">Выявление отклонения от плана</h4>
      <div>
        <p>{{ detailData.areaInput }}</p>
      </div>
    </div>
  </div>
</template>
