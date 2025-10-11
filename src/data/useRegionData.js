import regionsDatabase from './regionsData.json'

export const getRegionData = (regionId) => {
  return regionsDatabase[regionId] || null
}
