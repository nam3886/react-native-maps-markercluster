import React, { useCallback, useContext } from 'react'
import RNMapView, { Details, MapViewProps, Region } from 'react-native-maps'

export type MapViewRef = RNMapView

type Context = {
  readonly region?: Region
  readonly mapRef?: React.MutableRefObject<MapViewRef | undefined>
}

export const MapViewContext = React.createContext<Context>({})

export const useMapView = () => {
  const context = useContext(MapViewContext)
  if (!context) {
    throw new Error('useMapView must be used within a MapViewContext.Provider')
  }

  return context
}

type Props = MapViewProps & {
  readonly mapRef?: (ref?: MapViewRef) => void
}

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

  React.useEffect(() => {
    mapRefReceiver?.(mapRef.current)
  }, [mapRef, mapRefReceiver])

  const [currentRegion, setCurrentRegion] = React.useState(
    region || initialRegion
  )

  const handleOnRegionChangeComplete = useCallback(
    (r: Region, d: Details) => {
      setCurrentRegion(r)
      onRegionChangeComplete?.(r, d)
    },
    [onRegionChangeComplete]
  )

  return (
    <MapViewContext.Provider value={{ region: currentRegion, mapRef }}>
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
