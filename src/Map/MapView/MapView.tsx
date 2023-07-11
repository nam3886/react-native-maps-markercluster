import React from 'react'
import RNMapView, { Details, MapViewProps, Region } from 'react-native-maps'

export type MapViewRef = RNMapView

type Context = {
  readonly region?: Region
  readonly mapRef?: React.MutableRefObject<MapViewRef | undefined>
}

type Props = MapViewProps & {
  readonly mapRef?: (ref?: MapViewRef) => void
}

export const MapViewContext = React.createContext<Context>({})

export const MapView: React.FC<Props> = (props) => {
  const {
    region,
    initialRegion,
    onRegionChangeComplete,
    mapRef: mapRefReceiver,
    children,
    ...rest
  } = props
  const mapRef = React.useRef<MapViewRef>()
  const [currentRegion, setCurrentRegion] = React.useState(
    region || initialRegion
  )

  const handleOnRegionChangeComplete = (region: Region, details: Details) => {
    setCurrentRegion(region)
    onRegionChangeComplete?.(region, details)
  }

  React.useEffect(() => {
    mapRefReceiver?.(mapRef.current)
  }, [mapRef, mapRefReceiver])

  return (
    <MapViewContext.Provider
      value={{
        region: currentRegion,
        mapRef,
      }}
    >
      <RNMapView
        {...rest}
        ref={mapRef as any}
        region={region}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleOnRegionChangeComplete}
      >
        {children}
      </RNMapView>
    </MapViewContext.Provider>
  )
}
