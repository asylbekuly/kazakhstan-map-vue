<template>
  <div id="map"></div>
</template>

<script setup>
import regionsDatabase from '@/data/regionsData.json'
import { getRegionData } from '@/data/useRegionData.js'
import { onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const nameToKeyMap = {
  Astana: 'astana',
  'Almaty (city)': 'almaty',
  'Shymkent (city)': 'shimkent',
  Akmola: 'akmola',
  'North Kazakhstan': 'sko',
  Karaganda: 'karaganda',
  Ulytau: 'ulytau',
  Kostanay: 'kostanay',
  Pavlodar: 'pavlodar',
  'East Kazakhstan': 'vko',
  Abai: 'abai',
  Jetisu: 'jetisu',
  Almaty: 'almaty_obl',
  Atyrau: 'atyrau',
  Aktobe: 'aktobe',
  Mangystau: 'mangystau',
  'West Kazakhstan': 'zko',
  Jambyl: 'jambyl',
  Turkestan: 'turkestan',
  Kyzylorda: 'kyzylorda',
}

let map = null
const chartInstances = new Map()

async function loadGeoJSON() {
  const response = await fetch('/src/assets/kazakhstan.json')
  if (!response.ok) throw new Error('Failed to load Kazakhstan GeoJSON')
  return await response.json()
}

function showPopup(feature, latlng) {
  const regionName = feature.properties.name
  const regionKey = nameToKeyMap[regionName] || regionName.toLowerCase().replace(/\s+/g, '_')
  const regionInfo = getRegionData(regionKey)

  const canvasId = `chart-${regionKey ?? regionName.replace(/\s+/g, '-')}`

  
  const container = document.createElement('div')
  container.style.width = '320px'
  container.style.padding = '8px'

  if (regionInfo) {
    container.innerHTML = `
      <div style="font-weight:bold;font-size:16px;margin-bottom:6px">${regionInfo.name}</div>
      <div style="font-size:13px;margin-bottom:4px">
        Тип: ${regionInfo.type}<br/>
        Население: ${regionInfo.population.toLocaleString()} чел<br/>
        Площадь: ${regionInfo.area.toLocaleString()} км²<br/>
        Ср. температура: ${regionInfo.temp}°C<br/>
        Влажность: ${regionInfo.humidity}%<br/>
        Ветер: ${regionInfo.windSpeed} м/с
      </div>
    `
  } else {
    container.innerHTML = `<b>${regionName}</b><br/><i>Нет данных</i>`
  }


  const canvas = document.createElement('canvas')
  canvas.id = canvasId
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '120px'
  canvas.style.objectFit = 'contain'
  container.appendChild(canvas)

  
  L.popup({
    maxWidth: 400,
    maxHeight: 250,
    autoPan: true,
    closeButton: true,
  })
    .setLatLng(latlng)
    .setContent(container)
    .openOn(map)

  
  if (regionInfo?.monthlyData) {
    setTimeout(() => {
      const ctx = document.getElementById(canvasId)
      if (!ctx) return

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: regionInfo.monthlyData.map((m) => m.month),
          datasets: [
            {
              label: 'Температура (°C)',
              data: regionInfo.monthlyData.map((m) => m.temp),
              borderColor: '#ff5733',
              backgroundColor: 'rgba(255, 87, 51, 0.2)',
              borderWidth: 2,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.2,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { font: { size: 9 } },
            },
            title: {
              display: true,
              text: `${regionInfo.name} — Средние температуры`,
              font: { size: 13 },
            },
          },
          scales: {
            y: {
              ticks: { font: { size: 9 } },
              grid: { color: 'rgba(0,0,0,0.1)' },
            },
            x: {
              ticks: { font: { size: 9 } },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
          },
        },
      })
      chartInstances.set(canvasId, chart)
    }, 100)
  }
}

onMounted(async () => {
  map = L.map('map').setView([48.0196, 66.9237], 5) // начальные координаты и зум
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  const geojson = await loadGeoJSON()

  L.geoJSON(geojson, {
    style: { color: 'green', weight: 2, fillOpacity: 0.5 },
    onEachFeature: (feature, layer) => {
      const name = feature.properties.name
      layer.bindTooltip(name, { sticky: true })
      layer.on('click', (e) => showPopup(feature, e.latlng))
    },
  }).addTo(map)

  map.on('popupclose', (e) => {
    const canvas = e.popup.getElement()?.querySelector('canvas')
    if (canvas && chartInstances.has(canvas.id)) {
      chartInstances.get(canvas.id).destroy()
      chartInstances.delete(canvas.id)
    }
  })
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}
</style>
