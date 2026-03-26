<script setup>
import { vMaska } from "maska/vue";
const value = defineModel("value", { type: [String, Number] });
const options = reactive({
  eager: true,
  mask: "0.99",
  postProcess: (val) => {
    if (!val) return "";

    const sub = 3 - (val.includes(".") ? val.length - val.indexOf(".") : 0);

    return Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    })
      .format(val)
      .slice(0, sub ? -sub : undefined)
      .replace("$", "");
  },
  preProcess: (val) => val.replace(/[$,]/g, ""),
});
</script>
<template>
  <el-input
    v-model="value"
    style="display: none" />
  <div class="el-input">
    <input
      v-model="value"
      v-maska="options"
      class="el-input__inner"
      data-maska=""
      data-maska-tokens="0:\d:multiple|9:\d:optional" />
    <span class="el-input__suffix">
      <span class="el-input__suffix-inner">
        <i class="el-icon el-input__icon el-input__validateIcon">
          <svg
            v-if="!!value"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024">
            <path
              fill="currentColor"
              d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
            <path
              fill="currentColor"
              d="M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z"></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024">
            <path
              fill="currentColor"
              d="m466.752 512-90.496-90.496a32 32 0 0 1 45.248-45.248L512 466.752l90.496-90.496a32 32 0 1 1 45.248 45.248L557.248 512l90.496 90.496a32 32 0 1 1-45.248 45.248L512 557.248l-90.496 90.496a32 32 0 0 1-45.248-45.248z"></path>
            <path
              fill="currentColor"
              d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
          </svg>
        </i>
      </span>
    </span>
  </div>
</template>
