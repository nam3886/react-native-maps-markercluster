import { useContext } from "react";
import { MapViewContext } from "./MapView";

export const useMapViewContext = () => {
  const context = useContext(MapViewContext);

  return context;
};
