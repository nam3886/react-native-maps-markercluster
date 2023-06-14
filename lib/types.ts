import { LayoutAnimationConfig } from "react-native";
import { MarkerPressEvent } from "react-native-maps";
import Supercluster from "supercluster";

export namespace MarkerClusterType {
  export type Size = "small" | "medium" | "large";
  export type StyleProp = string | ((size: Size) => string);
  export type Cluster = ReturnType<Supercluster["getClusters"]>[number];
  export type ClusterChildren = ReturnType<Supercluster["getLeaves"]>;
  export type SpiderMarker = Cluster & {
    index: number;
    latitude: number;
    longitude: number;
    centerPoint: {
      latitude: number;
      longitude: number;
    };
  };

  export type WrapperProps = {
    readonly radius?: number;
    readonly clusteringEnabled?: boolean;
    readonly spiralEnabled?: boolean;
    readonly animationEnabled?: boolean;
    readonly preserveClusterPressBehavior?: boolean;
    readonly tracksViewChanges?: boolean;
    readonly layoutAnimationConf?: LayoutAnimationConfig;
    readonly maxZoom?: number;
    readonly minZoom?: number;
    readonly extent?: number;
    readonly nodeSize?: number;
    readonly minPoints?: number;
    readonly edgePadding?: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
    readonly spiderLineColor?: string;
    readonly onPressCluster?: (cluster: Cluster, markers?: Cluster[]) => void;
    readonly onMarkersChange?: (clusters?: Cluster[]) => void;
    readonly renderCluster?: (cluster: any) => React.ReactNode;
    readonly selectedClusterId?: string;
    readonly selectedClusterColor?: StyleProp;
    readonly clusterWrapperBackgroundColor?: StyleProp;
    readonly clusterBackgroundColor?: StyleProp;
    readonly clusterTextColor?: StyleProp;
    readonly clusterFontFamily?: StyleProp;
    readonly children?: React.ReactNode;
  };

  export type ClusterProps = {
    readonly geometry: Cluster["geometry"];
    readonly properties: Cluster["properties"];
    readonly onPress?: (event: MarkerPressEvent) => void;
    readonly clusterWrapperBackgroundColor?: StyleProp;
    readonly clusterBackgroundColor?: StyleProp;
    readonly clusterTextColor?: StyleProp;
    readonly clusterFontFamily?: StyleProp;
    readonly tracksViewChanges?: boolean;
  };

  export type GeoJSONFeature = {
    type: "Feature";
    geometry: {
      coordinates: [number, number];
      type: "Point";
    };
    properties: {
      point_count: number;
      index: number;
    };
  };
}
