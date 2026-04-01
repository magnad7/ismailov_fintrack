<template>
  <div class="page calendar-page">
    <div class="d-flex mb-30 between">
      <div>
        <h1>Calendar</h1>
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
