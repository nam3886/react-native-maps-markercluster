import React, { createContext, useEffect, useRef, useState } from "react";
import RNMapView, { Details, MapViewProps, Region } from "react-native-maps";

export type MapViewRef = RNMapView;

type Context = {
  readonly region?: Region;
  readonly mapRef?: React.MutableRefObject<MapViewRef | undefined>;
};

type Props = MapViewProps & {
  readonly mapRef?: (ref?: MapViewRef) => void;
};

export const MapViewContext = createContext<Context>({});

export const MapView: React.FC<Props> = ({ children, ...props }) => {
  const mapRef = useRef<MapViewRef>();
  const [currentRegion, setCurrentRegion] = useState(
    props.region || props.initialRegion
  );

  const onRegionChangeComplete = (region: Region, details: Details) => {
    setCurrentRegion(region);
    props.onRegionChangeComplete?.(region, details);
  };

  useEffect(() => {
    props.mapRef?.(mapRef.current);
  }, [mapRef]);

  return (
    <MapViewContext.Provider
      value={{
        region: currentRegion,
        mapRef,
      }}
    >
      <RNMapView
        {...props}
        ref={mapRef as any}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {children}
      </RNMapView>
    </MapViewContext.Provider>
  );
};
