import React from 'react'
import { Dimensions, LayoutAnimation, Platform } from 'react-native'
import Supercluster from 'supercluster'

import {
  calculateBBox,
  isMarker,
  markerToGeoJSONFeature,
  returnMapZoom,
} from '../MapView/helpers'
import { useMapViewContext } from '../MapView/useMapViewContext'
import { MarkerClusterType } from '../types'
import { MarkerClusterItem } from './MarkerClusterItem'

export const MarkerCluster: React.FC<MarkerClusterType.WrapperProps> =
  React.memo((props) => {
    const { region, mapRef } = useMapViewContext()

    const [clusters, setClusters] = React.useState<MarkerClusterType.Cluster[]>(
      []
    )
    const superClusterRef = React.useRef<Supercluster | undefined>(undefined)

    const childrenProp = React.useMemo(
      () => React.Children.toArray(props.children),
      [props.children]
    )

    React.useEffect(() => {
      initSuperCluster()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childrenProp, props.clusteringEnabled])

    React.useEffect(() => {
      onRegionChangeComplete()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [region])

    const onRegionChangeComplete = () => {
      if (!superClusterRef.current || !region) return

      const bBox = calculateBBox(region)
      const zoom = returnMapZoom(region, bBox, props.minZoom!)
      const newClusters = superClusterRef.current.getClusters(bBox, zoom)

      if (props.animationEnabled && Platform.OS === 'ios') {
        LayoutAnimation.configureNext(props.layoutAnimationConf!)
      }

      setClusters(newClusters)
      props.onMarkersChange?.(newClusters)
    }

    const handleOnClusterPress = (cluster: MarkerClusterType.Cluster) => () => {
      const children = superClusterRef.current?.getLeaves(
        Number(cluster.id),
        Infinity
      )

      if (props.preserveClusterPressBehavior) {
        props.onPressCluster?.(cluster, children)
        return
      }

      const coordinates = children?.map(({ geometry }) => ({
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      }))

      mapRef?.current?.fitToCoordinates(coordinates, {
        edgePadding: props.edgePadding,
      })

      props.onPressCluster?.(cluster, children)
    }

    const initSuperCluster = () => {
      if (!props.clusteringEnabled) {
        setClusters([])
        superClusterRef.current = undefined
        return
      }

      const rawData: MarkerClusterType.GeoJSONFeature[] = []

      childrenProp.forEach((child, index) => {
        isMarker(child) && rawData.push(markerToGeoJSONFeature(child, index))
      })

      superClusterRef.current = new Supercluster({
        radius: props.radius,
        maxZoom: props.maxZoom,
        minZoom: props.minZoom,
        minPoints: props.minPoints,
        extent: props.extent,
        nodeSize: props.nodeSize,
      })

      superClusterRef.current.load(rawData)

      const bBox = calculateBBox(region!)
      const zoom = returnMapZoom(region!, bBox, props.minZoom!)
      const newClusters = superClusterRef.current.getClusters(bBox, zoom)

      setClusters(newClusters)
    }

    const renderCluster = (cluster: MarkerClusterType.Cluster) => {
      if (cluster.properties.point_count === 0) {
        return childrenProp[cluster.properties.index]
      }

      if (props.renderCluster) {
        props.renderCluster({
          onPress: handleOnClusterPress(cluster),
          geometry: cluster.geometry,
          properties: cluster.properties,
          tracksViewChanges: props.tracksViewChanges,
          clusterWrapperBackgroundColor: props.clusterWrapperBackgroundColor,
          clusterTextColor: props.clusterTextColor,
          clusterFontFamily: props.clusterFontFamily,
          clusterBackgroundColor:
            props.selectedClusterId === cluster.id
              ? props.selectedClusterColor
              : props.clusterBackgroundColor,
        })
      }

      return (
        <MarkerClusterItem
          key={`cluster-${cluster.id}`}
          onPress={handleOnClusterPress(cluster)}
          geometry={cluster.geometry}
          properties={cluster.properties}
          tracksViewChanges={props.tracksViewChanges}
          clusterWrapperBackgroundColor={props.clusterWrapperBackgroundColor}
          clusterTextColor={props.clusterTextColor}
          clusterFontFamily={props.clusterFontFamily}
          clusterBackgroundColor={
            props.selectedClusterId === cluster.id
              ? props.selectedClusterColor
              : props.clusterBackgroundColor
          }
        />
      )
    }

    return <>{clusters.map((m) => renderCluster(m))}</>
  })

MarkerCluster.defaultProps = {
  clusteringEnabled: true,
  spiralEnabled: true,
  animationEnabled: true,
  preserveClusterPressBehavior: false,
  layoutAnimationConf: LayoutAnimation.Presets.spring,
  tracksViewChanges: false,
  // SuperCluster parameters
  radius: Dimensions.get('window').width * 0.06,
  maxZoom: 16,
  minZoom: 0,
  minPoints: 2,
  extent: 512,
  nodeSize: 64,
  // Map parameters
  edgePadding: { top: 50, left: 50, right: 50, bottom: 50 },
  // Cluster styles
  spiderLineColor: '#FF0000',
  // Callbacks
  onPressCluster: () => {},
  onMarkersChange: () => {},
}
