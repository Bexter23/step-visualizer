declare module 'occt-import-js' {
  interface OcctResult {
    success: boolean;
    root: {
      name: string;
      meshes: number[];
      children: any[];
    };
    meshes: Array<{
      name: string;
      color?: [number, number, number];
      attributes: {
        position: {
          array: number[];
        };
        normal?: {
          array: number[];
        };
      };
      index?: {
        array: number[];
      };
    }>;
  }

  interface OcctImportJS {
    ReadStepFile: (buffer: Uint8Array, params: any) => OcctResult;
    ReadBrepFile: (buffer: Uint8Array, params: any) => OcctResult;
    ReadIgesFile: (buffer: Uint8Array, params: any) => OcctResult;
  }

  function occtimportjs(): Promise<OcctImportJS>;
  export default occtimportjs;
} 