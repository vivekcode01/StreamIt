---
layout: api-docs
---

<script setup  lang="ts">
import { ApiReference } from "@scalar/api-reference";
import "@scalar/api-reference/style.css";
</script>


<ApiReference
  :configuration="{
    spec: {
      content: 'https://superstreamer.xyz/openapi-api.json'
    },
    hideTestRequestButton: true
  }" 
/>