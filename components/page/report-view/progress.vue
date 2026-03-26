<script setup>
const router = useRouter();
const variebleStore = useVariebleStore();
const emit = defineEmits(["submitData"]);
const plot = ref("");
const changeModel = ref("");
const emptyTechniqueObject = {
  technique: "",
  techniqueCount: "",
  worker: "",
  workerCount: "",
};
const techniqueList = ref([
  {
    technique: "",
    techniqueCount: "",
    worker: "",
    workerCount: "",
  },
]);

const emptyTaskObject = {
  axis: "",
  design: "",
  foreman: "",
  job_title: "",
  number_people: "",
  unit: "",
  volume: "",
};
const taskList = ref([
  {
    axis: "",
    design: "",
    foreman: "",
    job_title: "",
    number_people: "",
    unit: "",
    volume: "",
  },
]);

const submitFormElectricity = () => {
  emit("submitData", {
    changeModel: changeModel.value,
    plot: plot.value,
    taskList: taskList.value,
    techniqueList: techniqueList.value,
  });
};

// defineExpose({
//   // State
//   plot,
//   changeModel,
//   techniqueList,
//   taskList,

//   // Methods
//   submitFormElectricity,
// });
</script>

<template>
  <div class="page bg-white medium mb-24">
    <div class="page-form-header">
      <h3 class="mb-0">Ежедневный отчет по прогрессу</h3>
      <p
        class="mt-8"
        style="color: #727b87">
        Шапка отчета и 2 подтаблицы: техника/специалисты и задания
      </p>
    </div>
    <div class="page-form-body">
      <div class="d-flex mb-40">
        <div
          class="d-flex column mr-20"
          style="align-items: flex-start; width: max-content">
          Участок
          <el-input
            v-model="plot"
            style="width: 400px !important; height: 36px !important" />
        </div>
        <div
          class="d-flex column"
          style="align-items: flex-start; width: max-content">
          Смена
          <el-input
            v-model="changeModel"
            style="width: 300px !important; height: 36px !important" />
        </div>
      </div>
      <p class="mt-24 mb-8">Техника и спецыалисты</p>
      <div
        class="recursive-table mb-30"
        style="padding-top: 0">
        <div class="recursive-table-header d-flex">
          <el-row
            class="gap-20 w-full"
            :gutter="20">
            <el-col
              :xs="12"
              :sm="8">
              <span>Техника</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="4">
              <span>Количество</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="8">
              <span>Специальность рабочего</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="4">
              <span>Количество</span>
            </el-col>
          </el-row>
          <div
            class="empty"
            style="min-width: 70px"></div>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(techniqueItem, techniqueIndex) in techniqueList"
            :key="techniqueIndex + 'techniqueList'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="8">
                  <el-input
                    v-model="techniqueItem.technique"
                    placeholder="Техника" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="4">
                  <el-input
                    v-model="techniqueItem.techniqueCount"
                    placeholder="Количество" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="8">
                  <el-input
                    v-model="techniqueItem.worker"
                    placeholder="Специальность рабочего " />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="4">
                  <el-input
                    v-model="techniqueItem.workerCount"
                    placeholder="Количество" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="techniqueList.splice(techniqueIndex, 1)">
                <template #reference>
                  <el-button type="danger">
                    <Svg
                      class="mr-0"
                      name="delete" />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            <el-button
              v-if="techniqueIndex === techniqueList.length - 1"
              class="p-24 green"
              @click="techniqueList.push({ ...emptyTechniqueObject })">
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
          </template>
        </div>
      </div>
      <p class="mt-24 mb-8">Задание на сегодня</p>
      <div
        class="recursive-table"
        style="padding-top: 0">
        <div class="recursive-table-header d-flex">
          <el-row
            class="gap-20 w-full"
            :gutter="20">
            <el-col
              :xs="12"
              :sm="5">
              <span>Ответственный бригадир</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="5">
              <span>Наименование рабочего</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="4">
              <span>Конструкция</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="2">
              <span>Ось</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Ед.изм.</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Выполненный объем</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="2">
              <span>Кол-во людей</span>
            </el-col>
          </el-row>
          <div
            class="empty"
            style="min-width: 70px"></div>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(taskItem, taskIndex) in taskList"
            :key="taskIndex + 'techniqueList'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="5">
                  <el-input
                    v-model="taskItem.foreman"
                    placeholder="Ответственный бригадир" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="5">
                  <el-input
                    v-model="taskItem.job_title"
                    placeholder="Наименование рабочего" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="4">
                  <el-input
                    v-model="taskItem.design"
                    placeholder="Конструкция" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="2">
                  <el-input
                    v-model="taskItem.axis"
                    placeholder="Ось" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-select
                    v-model="taskItem.unit"
                    placeholder="Ед.изм">
                    <el-option
                      v-for="(
                        unitType, unitTypeIndex
                      ) in variebleStore.unit_types"
                      :key="unitTypeIndex"
                      :label="unitType"
                      :value="unitType" />
                  </el-select>
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="taskItem.volume"
                    placeholder="Выполненный объем" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="2">
                  <el-input
                    v-model="taskItem.number_people"
                    placeholder="Кол-во" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="taskList.splice(taskIndex, 1)">
                <template #reference>
                  <el-button type="danger">
                    <Svg
                      class="mr-0"
                      name="delete" />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            <el-button
              v-if="taskIndex === taskList.length - 1"
              class="p-24 green"
              @click="taskList.push({ ...emptyTaskObject })">
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
        @click.prevent="submitFormElectricity()">
        Сохранить
      </el-button>
    </div>
  </div>
</template>
