import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Marker } from 'react-native-maps'

import { getStyleProperty, returnMarkerStyle } from '../MapView/helpers'
import type { MarkerClusterType } from '../types'

export const MarkerClusterItem: React.FC<MarkerClusterType.ClusterProps> =
  React.memo((props) => {
    const points = props.properties.point_count
    const { width, height, fontSize, size } = returnMarkerStyle(points)

    // NOTE: STYLES
    const pointSize = React.useMemo<MarkerClusterType.Size>(
      () => (points < 10 ? 'small' : points < 100 ? 'medium' : 'large'),
      [points]
    )
    const clusterBackgroundColor = React.useMemo(
      () => getStyleProperty(pointSize, props.clusterBackgroundColor),
      [props.clusterBackgroundColor, pointSize]
    )
    const clusterWrapperBackgroundColor = React.useMemo(
      () => getStyleProperty(pointSize, props.clusterWrapperBackgroundColor),
      [props.clusterWrapperBackgroundColor, pointSize]
    )
    const clusterTextColor = React.useMemo(
      () => getStyleProperty(pointSize, props.clusterTextColor),
      [props.clusterTextColor, pointSize]
    )
    const clusterFontFamily = React.useMemo(
      () => getStyleProperty(pointSize, props.clusterFontFamily),
      [props.clusterFontFamily, pointSize]
    )

    return (
      <Marker
        key={`${props.geometry.coordinates[0]}_${props.geometry.coordinates[1]}`}
        coordinate={{
          longitude: props.geometry.coordinates[0],
          latitude: props.geometry.coordinates[1],
        }}
        style={{ zIndex: points + 1 }}
        onPress={props.onPress}
        tracksViewChanges={props.tracksViewChanges}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.container, { width, height }]}
        >
          <View
            style={[
              styles.wrapper,
              {
                backgroundColor: clusterWrapperBackgroundColor,
                width,
                height,
                borderRadius: width / 2,
              },
            ]}
          />
          <View
            style={[
              styles.cluster,
              {
                backgroundColor: clusterBackgroundColor,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: clusterTextColor,
                  fontSize,
                  fontFamily: clusterFontFamily,
                },
              ]}
            >
              {points}
            </Text>
          </View>
        </TouchableOpacity>
      </Marker>
    )
  })

MarkerClusterItem.defaultProps = {
  clusterWrapperBackgroundColor(size) {
    return {
      small: 'rgba(181, 226, 140, 0.6)',
      medium: 'rgba(241, 211, 87, 0.6)',
      large: 'rgba(253, 156, 115, 0.6)',
    }[size]
  },
  clusterBackgroundColor(size) {
    return {
      small: 'rgba(110, 204, 57, 0.6)',
      medium: 'rgba(240, 194, 12, 0.6)',
      large: 'rgba(241, 128, 23, 0.6)',
    }[size]
  },
  clusterTextColor: '#fff',
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    position: 'absolute',
  },
  cluster: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  text: {
    fontWeight: 'bold',
  },
})
