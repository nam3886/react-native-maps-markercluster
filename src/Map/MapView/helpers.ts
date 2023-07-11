import GeoViewport from '@mapbox/geo-viewport'
import type { Component } from 'react'
import { Dimensions } from 'react-native'
import type { MapMarkerProps, Region } from 'react-native-maps'

import type { MarkerClusterType } from '../types'

const { width, height } = Dimensions.get('window')

export const isMarker = (
  component: any
): component is Component<MapMarkerProps> =>
  component &&
  component.props &&
  component.props.coordinate &&
  component.props.cluster !== false

export const calculateBBox = (region: Region): GeoViewport.BoundingBox => {
  let lngD: number
  if (region.longitudeDelta < 0) lngD = region.longitudeDelta + 360
  else lngD = region.longitudeDelta

  return [
    region.longitude - lngD, // westLng - min lng
    region.latitude - region.latitudeDelta, // southLat - min lat
    region.longitude + lngD, // eastLng - max lng
    region.latitude + region.latitudeDelta, // northLat - max lat
  ]
}

export const returnMapZoom = (
  region: Region,
  bBox: GeoViewport.BoundingBox,
  minZoom: number
) => {
  const viewport =
    region.longitudeDelta >= 40
      ? { zoom: minZoom }
      : GeoViewport.viewport(bBox, [width, height])

  return viewport.zoom
}

export const markerToGeoJSONFeature = (
  marker: Component<MapMarkerProps>,
  index: number
): MarkerClusterType.GeoJSONFeature => {
  return {
    type: 'Feature',
    geometry: {
      coordinates: [
        marker.props.coordinate.longitude,
        marker.props.coordinate.latitude,
      ],
      type: 'Point',
    },
    properties: {
      point_count: 0,
      index,
      ..._removeChildrenFromProps(marker.props),
    },
  }
}

export const generateSpiral = (
  cluster: MarkerClusterType.Cluster,
  clusterChildren: MarkerClusterType.ClusterChildren,
  clusters: MarkerClusterType.Cluster[],
  index: number
) => {
  const { properties, geometry } = cluster
  const count = properties.point_count
  const centerLocation = geometry.coordinates

  let res: MarkerClusterType.SpiderMarker[] = []
  let angle = 0
  let start = 0

  for (let i = 0; i < index; i++) {
    start += clusters[i].properties.point_count || 0
  }

  for (let i = 0; i < count; i++) {
    angle = 0.25 * (i * 0.5)
    let latitude = centerLocation[1] + 0.0002 * angle * Math.cos(angle)
    let longitude = centerLocation[0] + 0.0002 * angle * Math.sin(angle)

    if (clusterChildren[i + start]) {
      res.push({
        ...cluster,
        index: clusterChildren[i + start].properties.index,
        longitude,
        latitude,
        centerPoint: {
          latitude: centerLocation[1],
          longitude: centerLocation[0],
        },
      })
    }
  }

  return res
}

export const returnMarkerStyle = (points: number) => {
  switch (true) {
    case points >= 50:
      return { width: 84, height: 84, size: 64, fontSize: 20 }
    case points >= 25:
      return { width: 78, height: 78, size: 58, fontSize: 19 }
    case points >= 15:
      return { width: 72, height: 72, size: 54, fontSize: 18 }
    case points >= 10:
      return { width: 66, height: 66, size: 50, fontSize: 17 }
    case points >= 8:
      return { width: 60, height: 60, size: 46, fontSize: 17 }
    case points >= 4:
      return { width: 54, height: 54, size: 40, fontSize: 16 }
    default:
      return { width: 48, height: 48, size: 36, fontSize: 15 }
  }
}

const _removeChildrenFromProps = (props: MapMarkerProps) => {
  const newProps: any = {}
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      newProps[key] = props[key as keyof typeof props]
    }
  })
  return newProps
}

export const getStyleProperty = (
  pointSize: MarkerClusterType.Size,
  prop?: MarkerClusterType.StyleProp
) => {
  return typeof prop === 'function' ? prop(pointSize) : prop
}
