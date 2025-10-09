<template>
  <div class="w-full h-screen">
    <l-map
      ref="mapRef"
      style="height: 100%; width: 100%"
      :zoom="5"
      :center="[48.0, 67.0]"
      :zoomControl="true"
      @ready="onMapReady"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      <!-- Remove the l-geo-json component for now and add it manually -->
    </l-map>
  </div>
</template>

<script setup>
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import { ref } from 'vue'
import geojsonRaw from '@/assets/kazakhstan.json'

const emit = defineEmits(['region-selected'])
const mapRef = ref(null)

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const geojsonData = typeof geojsonRaw === 'string' ? JSON.parse(geojsonRaw) : geojsonRaw

console.log('✅ GeoJSON features count:', geojsonData.features?.length)
console.log('🔍 First feature sample:', geojsonData.features?.[0])
console.log('🔍 Feature properties sample:', geojsonData.features?.[0]?.properties)

// стиль по умолчанию
const styleFeature = () => ({
  color: '#444',
  weight: 1,
  fillColor: '#6baed6',
  fillOpacity: 0.6,
  interactive: true, // 👈 обязательно
})

// добавляем события
const onEachFeature = (feature, layer) => {
  console.log('🎯 Setting up feature:', feature.properties)
  layer.options.interactive = true // 👈 обязательно

  layer.on('click', (e) => {
    console.log('🖱️ Клик произошел!')
    console.log('📍 Feature:', feature)
    console.log('📋 Properties:', feature.properties)
    console.log('🏷️ Name from properties:', feature.properties?.name)

    const name = feature.properties?.name || 'Неизвестный регион'

    // Пытаемся найти соответствующий регион в базе данных
    const regionId = getRegionIdFromName(name)
    console.log('🔍 Region ID:', regionId)

    if (regionId) {
      // Эмитим событие для открытия модального окна
      console.log('✅ Эмитим событие region-selected с:', regionId)
      emit('region-selected', regionId)
    } else {
      // Показываем popup если регион не найден в базе данных
      console.log('❌ Регион не найден в базе данных, показываем popup')
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`<b>${name}</b><br><small>Данные недоступны</small>`)
        .openOn(e.target._map)
    }
  })

  layer.on('mouseover', (e) => {
    e.target.setStyle({ fillColor: '#2171b5', fillOpacity: 0.8 })
  })

  layer.on('mouseout', (e) => {
    e.target.setStyle({ fillColor: '#6baed6', fillOpacity: 0.6 })
  })
}

// Функция для сопоставления названий регионов с ключами в базе данных
const getRegionIdFromName = (name) => {
  const nameMapping = {
    // Russian names
    Астана: 'astana',
    Алматы: 'almaty',
    Шымкент: 'shimkent',
    'Акмолинская область': 'akmo',
    'Северо-Казахстанская область': 'sko',
    'Восточно-Казахстанская область': 'vko',
    'Западно-Казахстанская область': 'zko',
    'Южно-Казахстанская область': 'yuko',

    // English names from GeoJSON
    'Nur-Sultan': 'astana',
    Astana: 'astana',
    Almaty: 'almaty',
    Shymkent: 'shimkent',
    Akmola: 'akmo',
    'North Kazakhstan': 'sko',
    'East Kazakhstan': 'vko',
    'West Kazakhstan': 'zko',
    'South Kazakhstan': 'yuko',
    Karaganda: 'akmo', // Assuming Karaganda is in Akmola region
    Aktobe: 'zko',
    Atyrau: 'zko',
    Kostanay: 'sko',
    Pavlodar: 'vko',
    Mangystau: 'zko',
    Zhambyl: 'yuko',
    Kyzylorda: 'yuko',
  }

  // Прямое соответствие
  if (nameMapping[name]) {
    return nameMapping[name]
  }

  // Поиск по частичному совпадению
  for (const [fullName, id] of Object.entries(nameMapping)) {
    if (
      name.toLowerCase().includes(fullName.toLowerCase()) ||
      fullName.toLowerCase().includes(name.toLowerCase())
    ) {
      return id
    }
  }

  return null
}

// Map ready handler - add GeoJSON manually to ensure click events work
const onMapReady = () => {
  console.log('📍 Map is ready, adding GeoJSON layer manually')
  const map = mapRef.value.leafletObject

  if (map && geojsonData) {
    const geoJsonLayer = L.geoJSON(geojsonData, {
      style: styleFeature,
      onEachFeature: onEachFeature,
      interactive: true,
    })

    geoJsonLayer.addTo(map)
    console.log('✅ GeoJSON layer added to map successfully')
  }
}
</script>
