<template>
  <div id="map"></div>
</template>

<script setup>
import { regionsDatabase, getRegionData } from '@/data/regionsData.js'
import { onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Chart, registerables } from 'chart.js'

// Register all chart.js components
Chart.register(...registerables)

const nameToKeyMap = {
  Astana: 'astana',
  'Almaty (city)': 'almaty',
  'Shymkent (city)': 'shimkent',
  Akmola: 'akmo',
  'North Kazakhstan': 'sko',
  'East Kazakhstan': 'vko',
  'West Kazakhstan': 'zko',
  Jambyl: 'yuko',
  Turkestan: 'yuko',
  Abai: 'vko', // example: Abai -> East Kazakhstan
  Karaganda: 'akmo', // example, adjust as you wish
  Jetisu: 'vko', // example, adjust as needed
  Atyrau: 'zko', // example mapping
  Aktobe: 'zko', // example mapping
  Kostanay: 'sko', // example mapping
  Kyzylorda: 'yuko', // example mapping
  Mangystau: 'zko', // example mapping
  Ulytau: 'akmo', // example mapping
  Pavlodar: 'vko', // example mapping
}

let map = null
const chartInstances = new Map()

// Example temperature data per region
const temperatureData = {
  'Shymkent (city)': [3, 6, 12, 18, 24, 28, 30, 29, 25, 17, 9, 4],
  Taraz: [2, 5, 10, 16, 23, 27, 29, 28, 23, 15, 8, 3],
}

// Load GeoJSON file
async function loadGeoJSON() {
  const response = await fetch('/src/assets/kazakhstan.json')
  if (!response.ok) throw new Error('Failed to load Kazakhstan GeoJSON')
  return await response.json()
}

function showPopup(feature, latlng) {
  const regionName = feature.properties.name
  const regionKey = nameToKeyMap[regionName]
  const regionInfo = getRegionData(regionKey)

  const canvasId = `chart-${regionKey ?? regionName.replace(/\s+/g, '-')}`

  // Create popup container
  const container = document.createElement('div')
  container.style.width = '360px'
  container.style.maxWidth = '100%'
  container.style.padding = '8px'
  container.style.overflow = 'hidden' // ✅ keeps content inside
  container.style.boxSizing = 'border-box'

  // Build region info HTML
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

  // Add a canvas for Chart.js
  const canvas = document.createElement('canvas')
  canvas.id = canvasId
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '180px'
  canvas.style.maxHeight = '180px'
  canvas.style.objectFit = 'contain'

  container.appendChild(canvas)

  // Open popup
  L.popup({ maxWidth: 420 }).setLatLng(latlng).setContent(container).openOn(map)

  // Draw chart
  if (regionInfo?.monthlyData) {
    setTimeout(() => {
      const ctx = document.getElementById(canvasId)
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: regionInfo.monthlyData.map((m) => m.month),
          datasets: [
            {
              label: 'Температура (°C)',
              data: regionInfo.monthlyData.map((m) => m.temp),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${regionInfo.name} — Средние температуры`,
            },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      })
    }, 100)
  }
}

onMounted(async () => {
  map = L.map('map').setView([48.0196, 66.9237], 5)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  try {
    const geojson = await loadGeoJSON()

    L.geoJSON(geojson, {
      style: {
        color: '#0077ff',
        weight: 1,
        fillOpacity: 0.3,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name
        layer.bindTooltip(name, { sticky: true })
        layer.on('click', (e) => showPopup(feature, e.latlng))
      },
    }).addTo(map)
  } catch (err) {
    console.error(err)
  }

  // Clean up chart when popup closes
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
