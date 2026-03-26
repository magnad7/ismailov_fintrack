<script setup>
defineProps({
  headers: {
    default: () => [],
    type: Array,
  },
});
</script>

<template>
  <div class="custom-list">
    <table>
      <thead>
        <tr>
          <th
            v-for="(header, index) in headers"
            :key="index"
            :colspan="header.colspan"
            :width="header.index ? '1%' : ''"
            :class="header.class">
            {{ header.index ? "№" : header.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style lang="scss"></style>
