<template>
  <div class="page calendar-page">
    <div class="d-flex mb-30 between">
      <div>
        <h1>Календарь. Управление событиями и планирование встреч</h1>
        <p class="m-0">Управление событиями и планирование встреч</p>
      </div>
    </div>
    <CustomCalendar />
  </div>
</template>

<style scoped lang="scss">
.calendar-page {
  height: calc(100vh - 48px);
  overflow: hidden;
  background: #fff;
}
</style>
