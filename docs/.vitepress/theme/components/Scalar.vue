<script setup lang="ts">
import { ref, effect } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();
const iframeRef = ref();

effect(() => {
  if (!iframeRef.value) {
    return;
  }

  const params = {
    url: frontmatter.value.spec,
    config: {},
  };

  const url = `https://superstreamer.xyz/scalar.html?params=${encodeURIComponent(JSON.stringify(params))}`;
  iframeRef.value.src = url;
});
</script>

<style scoped>
iframe {
  border: none;
  width: 100%;
  height: calc(100vh - var(--vp-nav-height));
}
</style>

<template>
  <iframe ref="iframeRef" />
</template>
