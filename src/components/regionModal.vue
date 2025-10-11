<template>
  <div
    v-if="regionData"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center rounded-t-lg"
      >
        <div>
          <h2 class="text-xl font-bold">{{ regionData.name }}</h2>
          <p class="text-blue-100 text-sm">{{ regionData.type }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-white hover:bg-blue-800 p-1 rounded-full transition w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div class="p-4">
        <!-- Essential Info Grid -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-blue-50 p-3 rounded-lg text-center">
            <p class="text-xs text-slate-600 mb-1">Население</p>
            <p class="text-lg font-bold text-blue-600">
              {{ regionData.population.toLocaleString() }}
            </p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg text-center">
            <p class="text-xs text-slate-600 mb-1">Площадь</p>
            <p class="text-lg font-bold text-green-600">{{ regionData.area }} км²</p>
          </div>
          <div class="bg-orange-50 p-3 rounded-lg text-center">
            <p class="text-xs text-slate-600 mb-1">Температура</p>
            <p class="text-lg font-bold text-orange-600">{{ regionData.temp }}°C</p>
          </div>
          <div class="bg-cyan-50 p-3 rounded-lg text-center">
            <p class="text-xs text-slate-600 mb-1">Осадки</p>
            <p class="text-lg font-bold text-cyan-600">{{ regionData.precipitation }} мм</p>
          </div>
        </div>

        <!-- Weather Info -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-purple-50 p-3 rounded-lg">
            <p class="text-xs text-slate-600 mb-2">Влажность</p>
            <div class="flex items-center">
              <div class="w-full bg-purple-200 rounded-full h-2 mr-2">
                <div
                  class="bg-purple-600 h-2 rounded-full"
                  :style="{ width: regionData.humidity + '%' }"
                ></div>
              </div>
              <p class="text-sm font-bold text-purple-600">{{ regionData.humidity }}%</p>
            </div>
          </div>
          <div class="bg-yellow-50 p-3 rounded-lg text-center">
            <p class="text-xs text-slate-600 mb-1">Ветер</p>
            <p class="text-lg font-bold text-yellow-600">{{ regionData.windSpeed }} м/с</p>
          </div>
        </div>

        <!-- Update Info -->
        <div class="text-center text-xs text-slate-500 border-t pt-3">
          ℹ️ Обновлено: {{ new Date().toLocaleString('ru-RU') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getRegionData } from '../data/regionsData'

const props = defineProps({
  region: String,
})

defineEmits(['close'])

const regionData = computed(() => getRegionData(props.region))

const monthlyDataPoints = computed(() => {
  if (!regionData.value || !regionData.value.monthlyData) return ''
  const data = regionData.value.monthlyData
  return data
    .map((d, i) => {
      const x = 70 + i * 50
      const y = 200 - (d.temp + 15) * 4 // Масштабирование
      return `${x},${y}`
    })
    .join(' ')
})
</script>