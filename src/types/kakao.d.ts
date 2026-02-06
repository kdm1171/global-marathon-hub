interface Window {
  kakao: {
    maps: {
      load: (callback: () => void) => void;
      LatLng: new (lat: number, lng: number) => any;
      Map: new (container: HTMLElement, options: any) => any;
      Marker: new (options: any) => any;
      event: {
        addListener: (target: any, type: string, handler: () => void) => void;
      };
      services: {
        Geocoder: new () => {
          addressSearch: (
            address: string,
            callback: (result: any[], status: string) => void,
          ) => void;
        };
        Status: {
          OK: string;
        };
      };
    };
  };
}
