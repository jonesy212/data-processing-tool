// drawingLibrary.d.ts

declare module "drawingLibrary" {
  // Type declaration for the DrawingError class
  export class DrawingError extends Error {
    constructor(errorType: string, details: string);
  }

  // Type declaration for drawing options
  export interface DrawingOptions {
    color: string; // Color of the shape
    size: number; // Size of the shape
    fillColor: string; // Fill color of the shape
    fill: boolean; // Whether the shape should be filled
    strokeColor: string; // Color of the shape's stroke (border)
    lineWidth: number; // Width of the shape's stroke (border)

    // Advanced drawing options
    opacity?: number; // Opacity of the shape (0 to 1)
    borderStyle?: string; // Style of the shape's border (e.g., solid, dashed)
    borderRadius?: number; // Radius of the corners for shapes like rectangles
    shadow?: {
      color: string; // Color of the shadow
      offsetX: number; // Horizontal offset of the shadow
      offsetY: number; // Vertical offset of the shadow
      blur: number; // Blur radius of the shadow
      spread?: number; // Spread of the shadow (optional)
      inset?: boolean; // Whether the shadow is an inset shadow (optional)
    };
    gradient?: {
      type: "linear" | "radial"; // Type of gradient (linear or radial)
      direction?: number; // Direction of the gradient (in degrees) for linear gradient
      startPoint?: { x: number; y: number }; // Starting point of the gradient for radial gradient
      endPoint?: { x: number; y: number }; // Ending point of the gradient for radial gradient
      colors: { color: string; position: number }[]; // Array of colors and their positions in the gradient
    };
    blendMode?: string; // Blend mode for blending the shape with underlying shapes or background
    filter?: string; // Filter effect applied to the shape (e.g., blur, sharpen)
    clippingPath?: boolean; // Whether to use the shape as a clipping path for other elements
    // Add more advanced drawing options as needed

    // Additional advanced options
    rotation?: number; // Rotation angle of the shape (in degrees)
    skew?: { x: number; y: number }; // Skew transformation applied to the shape
    scale?: { x: number; y: number }; // Scale transformation applied to the shape
    transformOrigin?: { x: number; y: number }; // Origin point for transformations
    pivotPoint?: { x: number; y: number }; // Pivot point for rotations and scaling
    lineCap?: "butt" | "round" | "square"; // Style of line caps for paths (e.g., butt, round, square)
    lineJoin?: "miter" | "round" | "bevel"; // Style of line joins for paths (e.g., miter, round, bevel)
    lineDash?: number[]; // Array of dash lengths for dashed lines
    lineDashOffset?: number; // Offset for dashed line pattern
    textAlign?: "left" | "center" | "right"; // Alignment of text within a shape
    textBaseline?: "top" | "middle" | "bottom"; // Baseline alignment of text within a shape
    font?: string; // Font properties for text rendering
    letterSpacing?: number; // Spacing between characters in text
    lineHeight?: number; // Height of each line in multiline text
    textDirection?: "ltr" | "rtl"; // Direction of text rendering (left-to-right or right-to-left)
    textWrap?: boolean; // Whether to wrap text within a shape
    textOverflow?: "clip" | "ellipsis"; // Behavior when text overflows its container
    // Add even more advanced drawing options as needed
  }

  // Type declaration for drawing functions
  // Type declaration for drawing functions
  export interface DrawingFunctions {
    drawCircle: (
      x: number,
      y: number,
      radius: number,
      options: DrawingOptions
    ) => void;
    drawRectangle: (
      x: number,
      y: number,
      width: number,
      height: number,
      options: DrawingOptions
    ) => void;
    drawLine: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      options: DrawingOptions
    ) => void;
    drawTriangle: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      x3: number,
      y3: number,
      options: DrawingOptions
    ) => void;
    drawPolygon: (
      points: { x: number; y: number }[],
      options: DrawingOptions
    ) => void;
    drawEllipse: (
      x: number,
      y: number,
      radiusX: number,
      radiusY: number,
      rotation: number,
      startAngle: number,
      endAngle: number,
      options: DrawingOptions
    ) => void;
    drawStar: (
      x: number,
      y: number,
      outerRadius: number,
      innerRadius: number,
      points: number,
      options: DrawingOptions
    ) => void;
    drawHexagon: (
      x: number,
      y: number,
      sideLength: number,
      options: DrawingOptions
    ) => void;
    drawOctagon: (
      x: number,
      y: number,
      sideLength: number,
      options: DrawingOptions
    ) => void;
    drawPentagon: (
      x: number,
      y: number,
      sideLength: number,
      options: DrawingOptions
    ) => void;
    drawHeart: (
      x: number,
      y: number,
      size: number,
      options: DrawingOptions
    ) => void;
    drawDiamond: (
      x: number,
      y: number,
      width: number,
      height: number,
      options: DrawingOptions
    ) => void;
    drawArrow: (
      x: number,
      y: number,
      length: number,
      direction: number,
      options: DrawingOptions
    ) => void;
    drawCloud: (
      x: number,
      y: number,
      radius: number,
      options: DrawingOptions
    ) => void;
    drawSpiral: (
      x: number,
      y: number,
      radius: number,
      numTurns: number,
      options: DrawingOptions
    ) => void;
    drawWave: (
      x: number,
      y: number,
      wavelength: number,
      amplitude: number,
      frequency: number,
      options: DrawingOptions
    ) => void;
    drawGrid: (
      x: number,
      y: number,
      width: number,
      height: number,
      gridSize: number,
      options: DrawingOptions
    ) => void;
    drawCheckerboard: (
      x: number,
      y: number,
      width: number,
      height: number,
      squareSize: number,
      options: DrawingOptions
    ) => void;
    drawCrosshatch: (
      x: number,
      y: number,
      width: number,
      height: number,
      spacing: number,
      angle: number,
      options: DrawingOptions
    ) => void;
    drawTextured: (
      x: number,
      y: number,
      texture: ImageData,
      options: DrawingOptions
    ) => void;
    drawGradient: (
      x: number,
      y: number,
      width: number,
      height: number,
      gradient: CanvasGradient,
      options: DrawingOptions
    ) => void;
    drawHatching: (
      x: number,
      y: number,
      width: number,
      height: number,
      angle: number,
      spacing: number,
      options: DrawingOptions
    ) => void;
    drawZigzag: (
      x: number,
      y: number,
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      numSegments: number,
      amplitude: number,
      options: DrawingOptions
    ) => void;
    drawWavyLine: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      wavelength: number,
      amplitude: number,
      options: DrawingOptions
    ) => void;
    drawDashedLine: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      dashLength: number,
      gapLength: number,
      options: DrawingOptions
    ) => void;
    drawDottedLine: (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      dotSpacing: number,
      options: DrawingOptions
    ) => void;
    drawCurvedLine: (
      x1: number,
      y1: number,
      controlX: number,
      controlY: number,
      x2: number,
      y2: number,
      options: DrawingOptions
    ) => void;
    drawTrapezoid: (
      x: number,
      y: number,
      topWidth: number,
      bottomWidth: number,
      height: number,
      options: DrawingOptions
    ) => void;
    drawIrregularPolygon: (
      vertices: { x: number; y: number }[],
      options: DrawingOptions
    ) => void;
    drawBezierSurface: (
      controlPoints: { x: number; y: number }[][],
      options: DrawingOptions
    ) => void;
    drawFractalTree: (
      x: number,
      y: number,
      trunkLength: number,
      numBranches: number,
      branchAngle: number,
      branchLengthRatio: number,
      options: DrawingOptions
    ) => void;
    drawSpirograph: (
      x: number,
      y: number,
      R: number,
      r: number,
      d: number,
      numSegments: number,
      options: DrawingOptions
    ) => void;
    drawBarcode: (
      x: number,
      y: number,
      data: string,
      options: DrawingOptions
    ) => void;
    drawFlowchart: (
      x: number,
      y: number,
      width: number,
      height: number,
      flowchartType: string,
      options: DrawingOptions
    ) => void;
    drawPixelArt: (
      x: number,
      y: number,
      pixelData: Uint8ClampedArray,
      width: number,
      height: number,
      options: DrawingOptions
    ) => void;

    drawText: (
      text: string,
      x: number,
      y: number,
      options: DrawingOptions
    ) => void;
    drawPath: (path: string, options: DrawingOptions) => void;
    drawImage: (
      image: HTMLImageElement | CanvasImageSource,
      x: number,
      y: number,
      width: number,
      height: number,
      options: DrawingOptions
    ) => void;
    drawBezierCurve: (
      startX: number,
      startY: number,
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      endX: number,
      endY: number,
      options: DrawingOptions
    ) => void;
    drawArc: (
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number,
      anticlockwise: boolean,
      options: DrawingOptions
    ) => void;
    createDrawing: (name: string, content: string) => Drawing 
    // Add more drawing functions if needed
  }
}
