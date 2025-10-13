<template>
  <div v-if="regionData">
    <div>
      <div>
        <div>
          <h2>{{ regionData.name }}</h2>
          <p>{{ regionData.type }}</p>
        </div>
        <button @click="$emit('close')">✕</button>
      </div>

      <div>
        <div>
          <div>
            <p>Население</p>
            <p>{{ regionData.population.toLocaleString() }}</p>
          </div>
          <div>
            <p>Площадь</p>
            <p>{{ regionData.area }} км²</p>
          </div>
          <div>
            <p>Температура</p>
            <p>{{ regionData.temp }}°C</p>
          </div>
          <div>
            <p>Осадки</p>
            <p>{{ regionData.precipitation }} мм</p>
          </div>
        </div>

        <div>
          <div>
            <p>Влажность</p>
            <div>
              <div>
                <div :style="{ width: regionData.humidity + '%' }"></div>
              </div>
              <p>{{ regionData.humidity }}%</p>
            </div>
          </div>
          <div>
            <p>Ветер</p>
            <p>{{ regionData.windSpeed }} м/с</p>
          </div>
        </div>

        <div>
          Обновлено: {{ new Date().toLocaleString('ru-RU') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getRegionData } from '../data/useRegionData'

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
      const y = 200 - (d.temp + 15) * 4
      return `${x},${y}`
    })
    .join(' ')
})
</script>
