<script setup>
const router = useRouter();
const variebleStore = useVariebleStore();
const emit = defineEmits(["submitData"]);
const areaInput = ref("");
const emptyWorkingTypeObject = {
  count: "",
  count_workers: "",
  drawing_name: "",
  Revision: "",
  unit: "",
  volume: "",
};
const workingType = ref([
  {
    data: [
      {
        count: "",
        count_workers: "",
        drawing_name: "",
        revision: "",
        unit: "",
        volume: "",
      },
    ],
    title: "",
  },
]);

const emptyPlanSmrObject = {
  count: "",
  date: "",
  name: "",
  note: "",
  number_index: "",
  unit: "",
};
const planSmrList = ref([
  {
    count: "",
    date: "",
    name: "",
    note: "",
    number_index: "",
    unit: "",
  },
]);

const emptyTechniqueObject = {
  count: "",
  number_index: "",
  unit: "",
};
const techniqueList = ref({
  data: [
    {
      count: "",
      number_index: "",
      unit: "",
    },
  ],
  worker: "",
  worker_pro: "",
});

const submitFormSmr = () => {
  emit("submitData", {
    areaInput: areaInput.value,
    planSmrList: planSmrList.value,
    techniqueList: techniqueList.value,
    workingType: workingType.value,
  });
};

// defineExpose({
//   // State
//   areaInput,
//   workingType,
//   planSmrList,
//   techniqueList,

//   // Methods
//   submitFormSmr,
// });
</script>

<template>
  <div class="page bg-white medium mb-24">
    <div class="page-form-header">
      <h3 class="mb-0">Ежедневный отчет СМР</h3>
      <p
        class="mt-8"
        style="color: #727b87">
        Основная таблица, план СМР, техника и причины отстования.
      </p>
    </div>
    <div class="page-form-body">
      <p class="mt-24 mb-8">Основная таблица СМР</p>
      <div
        v-for="(workingTypeItem, workingTypeIndex) in workingType"
        :key="workingTypeIndex + 'workingType'"
        class="recursive-table"
        :style="`padding-top: ${workingTypeIndex === 0 ? '0' : '20px'}`">
        <div class="recursive-table-header d-flex">
          <div class="d-flex">
            <span>Вид работ</span>
            <el-input
              v-model="workingTypeItem.title"
              style="
                width: 100% !important;
                max-width: 400px !important;
                height: 40px !important;
                background: #fff !important;
              " />
          </div>
          <el-button
            v-if="workingTypeIndex === 0"
            class="p-24 green"
            @click="
              workingTypeItem.data.unshift({ ...emptyWorkingTypeObject })
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
            v-if="workingTypeIndex === 0"
            type="primary"
            class="p-24"
            @click="
              workingType.unshift({
                title: '',
                data: [{ ...emptyWorkingTypeObject }],
              })
            ">
            Добавить вид работ
          </el-button>
          <el-popconfirm
            v-if="workingTypeIndex > 0"
            title="Вы уверены, что хотите это удалить?"
            @confirm="workingType.splice(workingTypeIndex, 1)">
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
            v-for="(item, workingTypeItemIndex) in workingTypeItem.data"
            :key="workingTypeItemIndex + 'workingTypeItem'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="8">
                  <el-input
                    v-model="item.drawing_name"
                    placeholder="Наименование чертежа" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="4">
                  <el-input
                    v-model="item.revision"
                    placeholder="Ревизия" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-select
                    v-model="item.unit"
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
                    v-model="item.count"
                    placeholder="Кол-во" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="item.volume"
                    placeholder="Объем" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="item.count_workers"
                    placeholder="Кол-во рабочих" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="workingTypeItem.data.splice(workingTypeItemIndex, 1)">
                <template #reference>
                  <el-button type="danger">
                    <Svg
                      class="mr-0"
                      name="delete" />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </div>
      </div>

      <p class="mt-24 mb-8">План СМР</p>
      <div
        class="recursive-table"
        style="padding-top: 0">
        <div class="recursive-table-header d-flex">
          <el-row
            class="gap-20 w-full"
            :gutter="20">
            <el-col
              :xs="12"
              :sm="6">
              <span>№ по ГП / пикет</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Наименование выполненных СМР</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Ед.изм</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Кол-во</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Время инспекции</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Примечание</span>
            </el-col>
          </el-row>
          <div
            class="empty"
            style="min-width: 70px"></div>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(planItem, planItemIndex) in planSmrList"
            :key="planItemIndex + 'planSmrList'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="planItem.number_index"
                    placeholder="№ по ГП / пикет" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="planItem.name"
                    placeholder="Наименование выполненных СМР" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-select
                    v-model="planItem.unit"
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
                    v-model="planItem.count"
                    placeholder="Кол-во" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="planItem.date"
                    placeholder="Время инспекции" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="planItem.note"
                    placeholder="Примечание" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="planSmrList.splice(planItemIndex, 1)">
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
              v-if="planItemIndex === planSmrList.length - 1"
              class="p-24 green"
              @click="planSmrList.push({ ...emptyPlanSmrObject })">
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

      <el-row
        class="gap-20"
        :gutter="20">
        <el-col
          :xs="24"
          :md="12">
          <p class="mt-24 mb-8">Техника</p>
          <div
            class="recursive-table"
            style="padding-top: 0; border-bottom: none">
            <div class="recursive-table-header d-flex">
              <el-row
                class="gap-20 w-full"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="8">
                  <span>№ по ГП / пикет</span>
                </el-col>
                <el-col
                  :xs="12"
                  :sm="8">
                  <span>Ед.изм</span>
                </el-col>
                <el-col
                  :xs="12"
                  :sm="8">
                  <span>Кол-во</span>
                </el-col>
              </el-row>
              <div
                class="empty"
                style="width: 60px"></div>
            </div>
            <div class="recursive-table-body">
              <template
                v-for="(techniqueItem, techniqueIndex) in techniqueList.data"
                :key="techniqueIndex + 'planSmrList'">
                <div class="recursive-table-item">
                  <el-row
                    class="gap-20"
                    :gutter="20">
                    <el-col
                      :xs="12"
                      :sm="8">
                      <el-input
                        v-model="techniqueItem.number_index"
                        placeholder="№ по ГП / пикет" />
                    </el-col>

                    <el-col
                      :xs="12"
                      :sm="8">
                      <el-select
                        v-model="techniqueItem.unit"
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
                      :sm="8">
                      <el-input
                        v-model="techniqueItem.count"
                        placeholder="Кол-во" />
                    </el-col>
                  </el-row>
                  <el-popconfirm
                    title="Вы уверены, что хотите это удалить?"
                    @confirm="techniqueList.data.splice(techniqueIndex, 1)">
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
                  v-if="techniqueIndex === techniqueList.data.length - 1"
                  class="p-24 green"
                  @click="techniqueList.data.push({ ...emptyTechniqueObject })">
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
        </el-col>
        <el-col
          :xs="24"
          :md="12">
          <p class="mt-24 mb-8">
            Персонал / Количество задействованных работников
          </p>
          <div
            class="recursive-table"
            style="padding-top: 0; border-bottom: none">
            <div class="recursive-table-header">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col :span="12">
                  <span>Итр - чел</span>
                </el-col>
                <el-col :span="12">
                  <span>Рабочие</span>
                </el-col>
              </el-row>
            </div>
            <div class="recursive-table-body">
              <div class="recursive-table-item">
                <el-row
                  class="gap-20"
                  :gutter="20">
                  <el-col :span="12">
                    <el-input
                      v-model="techniqueList.worker_pro"
                      placeholder="Итр - чел" />
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      v-model="techniqueList.worker"
                      placeholder="Рабочие" />
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div
        class="d-flex column mb-40 w-full"
        style="align-items: flex-start">
        <span class="mb-8">Причины отстования от графикаа</span>
        <el-input
          v-model="areaInput"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 10 }"
          placeholder="Опишите причины если есть"
          style="width: 100% !important; background: #fff !important" />
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
        @click.prevent="submitFormSmr()">
        Сохранить
      </el-button>
    </div>
  </div>
</template>
