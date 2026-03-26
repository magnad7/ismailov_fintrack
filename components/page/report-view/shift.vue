<script setup>
const router = useRouter();
const variebleStore = useVariebleStore();
const emit = defineEmits(["submitData"]);
const plot = ref("");

const emptyDetailObject = {
  altitude_mark: "",
  count: "",
  name_material: "",
  part_band: "",
  weight: "",
  x_y: "",
};
const detailList = ref([
  {
    altitude_mark: "",
    count: "",
    name_material: "",
    part_band: "",
    weight: "",
    x_y: "",
  },
]);

const emptyStaffObject = {
  count: "",
  name: "",
  note: "",
  unit: "",
};
const staffList = ref([
  {
    count: "",
    name: "",
    note: "",
    unit: "",
  },
]);

const emptyTechniqueObject = {
  count: "",
  name: "",
  note: "",
  unit: "",
};
const techniqueList = ref([
  {
    count: "",
    name: "",
    note: "",
    unit: "",
  },
]);

const submitFormElectricity = () => {
  emit("submitData", {
    detailList: detailList.value,
    plot: plot.value,
    staffList: staffList.value,
    techniqueList: techniqueList.value,
  });
};

// defineExpose({
//   // State
//   plot,
//   detailList,
//   staffList,
//   techniqueList,

//   // Methods
//   submitFormElectricity,
// });
</script>

<template>
  <div class="page bg-white medium mb-24">
    <div class="page-form-header">
      <h3 class="mb-0">Ежедневный сменный рапорт</h3>
      <p
        class="mt-8"
        style="color: #727b87">
        Unit №, детали, техника.
      </p>
    </div>
    <div class="page-form-body">
      <div class="d-flex mb-40">
        <div
          class="d-flex column mr-20"
          style="align-items: flex-start; width: max-content">
          Unit №
          <el-input
            v-model="plot"
            style="width: 400px !important; height: 36px !important" />
        </div>
      </div>
      <p class="mt-24 mb-8">Детали</p>
      <div
        class="recursive-table mb-30"
        style="padding-top: 0">
        <div class="recursive-table-header d-flex">
          <el-row
            class="gap-20 w-full"
            :gutter="20">
            <el-col
              :xs="12"
              :sm="6">
              <span>Марка детали</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Масса</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="5">
              <span>Название материала</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Кол-во</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="4">
              <span>Высотная отметка</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="3">
              <span>Х/Y</span>
            </el-col>
          </el-row>
          <div
            class="empty"
            style="min-width: 70px"></div>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(detailItem, detailIndex) in detailList"
            :key="detailIndex + 'detailList'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="detailItem.part_band"
                    placeholder="Марка детали" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="detailItem.weight"
                    placeholder="Масса" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="5">
                  <el-input
                    v-model="detailItem.name_material"
                    placeholder="Название материала" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="detailItem.count"
                    placeholder="Кол-во" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="4">
                  <el-input
                    v-model="detailItem.altitude_mark"
                    placeholder="Высотная отметка" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="3">
                  <el-input
                    v-model="detailItem.x_y"
                    placeholder="Х/Y" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="detailList.splice(detailIndex, 1)">
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
              v-if="detailIndex === detailList.length - 1"
              class="p-24 green"
              @click="detailList.push({ ...emptyDetailObject })">
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
      <p class="mt-24 mb-8">Персонал</p>
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
              <span>Наименование</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Ед.изм</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Количество</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Примечание</span>
            </el-col>
          </el-row>
          <div
            class="empty"
            style="min-width: 70px"></div>
        </div>
        <div class="recursive-table-body">
          <template
            v-for="(staffItem, taskIndex) in staffList"
            :key="taskIndex + 'detailList'">
            <div class="recursive-table-item">
              <el-row
                class="gap-20"
                :gutter="20">
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="staffItem.name"
                    placeholder="Наименование" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-select
                    v-model="staffItem.unit"
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
                  :sm="6">
                  <el-input
                    v-model="staffItem.count"
                    placeholder="Количество" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="staffItem.note"
                    placeholder="Примечание" />
                </el-col>
              </el-row>
              <el-popconfirm
                title="Вы уверены, что хотите это удалить?"
                @confirm="staffList.splice(taskIndex, 1)">
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
              v-if="taskIndex === staffList.length - 1"
              class="p-24 green"
              @click="staffList.push({ ...emptyStaffObject })">
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

      <p class="mt-24 mb-8">Техника</p>
      <div
        class="recursive-table mb-30"
        style="padding-top: 0">
        <div class="recursive-table-header d-flex">
          <el-row
            class="gap-20 w-full"
            :gutter="20">
            <el-col
              :xs="12"
              :sm="6">
              <span>Наименование</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Ед.изм</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Количество</span>
            </el-col>
            <el-col
              :xs="12"
              :sm="6">
              <span>Примечание</span>
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
                  :sm="6">
                  <el-input
                    v-model="techniqueItem.name"
                    placeholder="Наименование" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
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
                  :sm="6">
                  <el-input
                    v-model="techniqueItem.count"
                    placeholder="Количество" />
                </el-col>
                <el-col
                  :xs="12"
                  :sm="6">
                  <el-input
                    v-model="techniqueItem.note"
                    placeholder="Примечание" />
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
