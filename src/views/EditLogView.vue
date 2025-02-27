<template>
  <LogEditor :id="id" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import LogEditor from '../components/LogEditor.vue'

const route = useRoute()
const id = route.params.id as string
</script> 