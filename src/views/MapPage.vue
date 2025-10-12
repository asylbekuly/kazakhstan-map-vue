<template>
  <KazakhstanMap @region-selected="openModal" />
  <RegionModal v-if="showModal" :region="selectedRegion" @close="showModal = false" />
</template>

<script setup>
import { ref } from 'vue'
import KazakhstanMap from '@/components/KazakhstanMap.vue'
import RegionModal from '@/components/regionModal.vue'

const showModal = ref(false)
const selectedRegion = ref(null)

function openModal(regionId) {
  selectedRegion.value = regionId
  showModal.value = true
}
</script>
