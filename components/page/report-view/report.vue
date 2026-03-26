<script setup>
const router = useRouter();
const emit = defineEmits(["submitData"]);
const emptyworkingTypeReportObject = {
  area_f: "",
  brigadier: "",
  diameter: "",
  joint_number: "",
  material_1: "",
  material_2: "",
  remarks: "",
  revision: "",
  sheet_number: "",
  thickness: "",
  welder_1: "",
  welder_2: "",
  welding_date: "",
};
const workingTypeReport = ref([
  {
    data: [
      {
        area_f: "",
        brigadier: "",
        diameter: "",
        drawing_name: "",
        joint_number: "",
        material_1: "",
        material_2: "",
        remarks: "",
        revision: "",
        sheet_number: "",
        thickness: "",
        welder_1: "",
        welder_2: "",
        welding_date: "",
      },
    ],
    title: "",
  },
]);

const submitFormReport = () => {
  emit("submitData", {
    workingTypeReport: workingTypeReport.value,
  });
};

// defineExpose({
//   // State
//   workingTypeReport,

//   // Methods
//   submitFormReport,
// });
</script>

<template>
  <div class="page bg-white medium mb-24">
    <div class="page-form-header">
      <h3 class="mb-0">Сварочный отчет</h3>
      <p
        class="mt-8"
        style="color: #727b87">
        Заполните сведения по сварке.
      </p>
    </div>
    <div class="page-form-body">
      <p class="mt-24 mb-8">Заполните сведения по сварке.</p>
      <div
        v-for="(
          workingTypeReportItem, workingTypeReportIndex
        ) in workingTypeReport"
        :key="workingTypeReportIndex + 'workingTypeReport'"
        class="recursive-table"
        :style="`padding-top: ${workingTypeReportIndex === 0 ? '0' : '20px'}`">
        <div class="recursive-table-header d-flex">
          <div class="d-flex">
            <span>Номер линии</span>
            <el-input
              v-model="workingTypeReportItem.title"
              style="
                width: 100% !important;
                max-width: 400px !important;
                height: 40px !important;
                background: #fff !important;
              " />
          </div>
          <el-button
            v-if="workingTypeReportIndex === 0"
            class="p-24 green"
            @click="
              workingTypeReportItem.data.unshift({
                ...emptyworkingTypeReportObject,
              })
            ">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.33203 8.66683H3.33203V7.3335H7.33203V3.3335H8.66536V7.3335H12.6654V8.66683H8.66536V12.6668H7.33203V8.66683Z"
                fill="white" />
            </svg>
            Добавить строку
          </el-button>
          <el-button
            v-if="workingTypeReportIndex === 0"
            type="primary"
            class="p-24"
            @click="
              workingTypeReport.unshift({
                title: '',
                data: [{ ...emptyworkingTypeReportObject }],
              })
            ">
            Добавить вид работ
          </el-button>
          <el-popconfirm
            v-if="workingTypeReportIndex > 0"
            title="Вы уверены, что хотите это удалить?"
            @confirm="workingTypeReport.splice(workingTypeReportIndex, 1)">
            <template #reference>
              <el-button type="danger">
                <Svg
                  class="mr-0"
                  name="delete" />
              </el-button>
            </template>
          </el-popconfirm>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(
              item, workingTypeReportItemIndex
            ) in workingTypeReportItem.data"
            :key="workingTypeReportItemIndex + 'workingTypeReportItem'">
            <div class="recursive-table-item d-block">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.drawing_name"
                    placeholder="Наименование чертежа" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.revision"
                    placeholder="Ревизия" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.sheet_number"
                    placeholder="Лист №" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.area_f"
                    placeholder="Площадь F" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.joint_number"
                    placeholder="Стык №" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.material_1"
                    placeholder="Материал 1" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.material_2"
                    placeholder="Материал 2" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.diameter"
                    placeholder="Диаметр (mm)" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.thickness"
                    placeholder="Толщина (mm)" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.brigadier"
                    placeholder="Клеймо бригодира" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.welding_date"
                    placeholder="Дата сварки" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.welder_1"
                    placeholder="Welder 1" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.welder_2"
                    placeholder="Welder 2" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="item.remarks"
                    placeholder="Remarks" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-popconfirm
                    title="Вы уверены, что хотите это удалить?"
                    @confirm="
                      workingTypeReportItem.data.splice(
                        workingTypeReportItemIndex,
                        1
                      )
                    ">
                    <template #reference>
                      <el-button type="danger">
                        <Svg
                          class="mr-0"
                          name="delete" />
                      </el-button>
                    </template>
                  </el-popconfirm>
                </el-col>
              </el-row>
              <div class="page-form-body-hr m-20"></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="page-form-footer mt-24">
      <el-button
        type="primary"
        class="p-24"
        plain
        @click.prevent="router.go(-1)">
        Отмена
      </el-button>
      <el-button
        type="primary"
        class="p-24"
        @click.prevent="submitFormReport()">
        Сохранить
      </el-button>
    </div>
  </div>
</template>
