// constants
const canvasElement = document.querySelector("#diagramCanvas");
const ctx = canvasElement.getContext("2d");
const DiagrammicDrawingHolder = document.querySelector("#diagrammicDrawing");

const rotateImg = new Image();
rotateImg.src = "assets/form/diagrammic/RotateArc.svg";

let isModalOpen = false;
let modelClicksInitalized = false;
let resolvePromptDraw = null;

let currentlySelectedDiagram = null;

let rootRoadNode = null;
let app = null;
let diagramImageCache = [];
let isEditorOpen = false;

const canvasProperties = {
  canvasWidth: ctx.canvas.width,
  canvasHeight: ctx.canvas.width,
  laneWidth: 40,
  roadMarkingSize: 36,
  roadMarkingWidth: 4,
};

const editorProperties = {
  selectedRoad: null,
  movingRoad: null,
  cursorState: "NONE", // "NONE", "DRAG"
  dragItem: "NONE", // "POINT", "ROTATE", "ARROW", "SUBPANEL_POINT", "SHIFT_LEFT", "SHIFT_RIGHT"
  startDragPoint: null,
  usedSubpanelNumbers: [],
  points: {
    startPoint: null,
    endPoint: null,
    arrow: null,
    rotatePoint: null,
    shiftLeft: null,
    shiftRight: null,
    subpanelPoint: null,
  },
};

const editorConnections = {
  dragOrClickStart: null,
  dragMove: null,
  dragRelease: null,
  roadMove: null,
  roadDuplicate: null,
  roadDelete: null,
  keyboardInput: null,
  savePreset: null,
  usePreset: null,
  deletePreset: null,
  renamePreset: null,
  closeEditor: null,
  usePresetInSign: null,
};

// editor connections
const trackEditorConnection = (target, type, listener, options) => {
  target.addEventListener(type, listener, options);
  return { target, type, listener, options };
};

const deleteEditorConnections = () => {
  for (const key in editorConnections) {
    const connection = editorConnections[key];
    if (!connection) {
      continue;
    }

    connection.target.removeEventListener(
      connection.type,
      connection.listener,
      connection.options,
    );
    editorConnections[key] = null;
  }
};

// classes
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static lerp(p1, p2, percent) {
    let distance =
      Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * percent;
    let angle = Point.getLineAngle(p1, p2);
    return new Point(
      p1.x + distance * Math.cos(angle),
      p1.y + distance * Math.sin(angle),
    );
  }

  static quadraticLerp(p1, p2, p3, percent) {
    return this.lerp(
      this.lerp(p1, p2, percent),
      this.lerp(p2, p3, percent),
      percent,
    );
  }

  static cubicLerp(p1, p2, p3, p4, percent) {
    return this.lerp(
      this.quadraticLerp(p1, p2, p3, percent),
      this.quadraticLerp(p2, p3, p4, percent),
      percent,
    );
  }

  static distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  static getLineAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  static getPerpendicularShift(p1, p2, sign, shift) {
    const angle = Point.getLineAngle(p2, p1);
    const shiftAngle = angle + (sign * Math.PI) / 2;
    return new Point(
      p1.x + shift * Math.cos(shiftAngle),
      p1.y + shift * Math.sin(shiftAngle),
    );
  }
}

class Road {
  constructor({
    numLanes = 1, // number, number of road lanes
    roadType = "straight", // "straight", "curve", "arc", road type
    startPoint = null, // Point, location of where road path starts. should ONLY be defined for the root, otherwise INTERNALLY used
    endTransformation = null, // Point, relative location of the point through a XY transformation
    endPoint = null, // Point, absolute location of where road path ends, INTERNALLY USED
    endAngle = null, // number, uses the 3rd control point (or start angle)
    name = "", // string, name of road segment
    laneOffset = 0, // number, (+) to the right, (-) to the left
    curveIntensity = 0, // number, how "curvy" the road is
    arrows = {
      enabled: false, // boolean, are arrows enabled
      arrowHeight: 0, // number, height of arrow (0 = auto)
      arrowWidth: 0, // number, width of arrow (0 = auto)
      bottomOffset: 20, // number, how "dented" the arrow base is
      roundness: 2, // number, how "round" the corners are
      pointedTip: true,
    },
    subpanel = {
      enabled: false, // boolean, where the road is
      x: 0, // number, x-coordinate
      y: 0, // number, y-coordinate
      subpanelNumber: -1, // number, subpanel to be used
      direction: null, // "left", "right", "top", "bottom",
      manualDirection: "auto", // "auto", "left", "right", "top", "bottom"
    },
    roadMarkingsEnabled = true,
    isSegmentVisible = true,
  } = {}) {
    this.numLanes = numLanes;
    this.roadType = roadType;
    this.startPoint = startPoint;
    this.endTransformation = endTransformation;
    this.endPoint = endPoint;
    this.endAngle = endAngle;
    this.name = name;
    this.children = [];
    this.laneOffset = laneOffset;
    this.curveIntensity = curveIntensity;

    this.arrows = {
      ...arrows,
    };

    this.subpanel = {
      ...subpanel,
    };

    this.calculatedPoints = [];
    this.calculatedPath2D = null;
    this.roadIsRendered = false;
    this.previousRoad = null;
    this.roadMarkingsEnabled = roadMarkingsEnabled;
    this.isSegmentVisible = isSegmentVisible;
  }

  // drawing
  static checkOffset(numLanes, previousLanes) {
    return (
      ((numLanes & 1) == 1 && (previousLanes & 1) == 0) ||
      ((numLanes & 1) == 0 && (previousLanes & 1) == 1)
    );
  }

  // pre-reqs: endTransformation MUST be defined
  drawRoadSegment(previousRoad) {
    if (!this.endTransformation) {
      throw new Error("endTransformation not defined");
    }

    this.previousRoad = previousRoad;
    if (
      previousRoad &&
      (this.laneOffset != 0 ||
        Road.checkOffset(this.numLanes, previousRoad.numLanes))
    ) {
      const shiftAngle = previousRoad.endAngle + Math.PI / 2;
      let shiftDistance = this.laneOffset * canvasProperties.laneWidth;

      if (Road.checkOffset(this.numLanes, previousRoad.numLanes)) {
        shiftDistance += 0.5 * canvasProperties.laneWidth;
      }

      this.startPoint = new Point(
        previousRoad.endPoint.x + shiftDistance * Math.cos(shiftAngle),
        previousRoad.endPoint.y + shiftDistance * Math.sin(shiftAngle),
      );
    } else if (previousRoad) {
      this.startPoint = previousRoad.endPoint;
    } else if (!this.startPoint) {
      throw new Error("Start point MUST be defined");
    }

    this.endPoint = new Point(
      this.startPoint.x + this.endTransformation.x,
      this.startPoint.y + this.endTransformation.y,
    );

    if (this.subpanel.x <= 0 || this.subpanel.y <= 0) {
      this.subpanel.x = Point.lerp(this.startPoint, this.endPoint, 0.5).x;
      this.subpanel.y = Point.lerp(this.startPoint, this.endPoint, 0.5).y;
    }

    ctx.setLineDash([]);
    this.calculatedPath2D = new Path2D();
    this.roadIsRendered = false;

    // road segment
    switch (this.roadType) {
      case "straight": {
        this.calculatedPoints = [
          Point.lerp(this.startPoint, this.endPoint, 0.25),
          Point.lerp(this.startPoint, this.endPoint, 0.75),
        ];
        this.endAngle = Point.getLineAngle(this.startPoint, this.endPoint);

        let leftEdgeStart = Point.getPerpendicularShift(
          this.startPoint,
          this.endPoint,
          1,
          canvasProperties.laneWidth * (this.numLanes / 2),
        );
        let leftEdgeEnd = Point.getPerpendicularShift(
          this.endPoint,
          this.startPoint,
          -1,
          canvasProperties.laneWidth * (this.numLanes / 2),
        );

        let rightEdgeStart = Point.getPerpendicularShift(
          this.startPoint,
          this.endPoint,
          -1,
          canvasProperties.laneWidth * (this.numLanes / 2),
        );
        let rightEdgeEnd = Point.getPerpendicularShift(
          this.endPoint,
          this.startPoint,
          1,
          canvasProperties.laneWidth * (this.numLanes / 2),
        );

        this.calculatedPath2D.moveTo(leftEdgeStart.x, leftEdgeStart.y);
        this.calculatedPath2D.lineTo(leftEdgeEnd.x, leftEdgeEnd.y);
        this.calculatedPath2D.lineTo(rightEdgeEnd.x, rightEdgeEnd.y);
        this.calculatedPath2D.lineTo(rightEdgeStart.x, rightEdgeStart.y);

        this.calculatedPath2D.closePath();
        break;
      }
      case "merge": {
        if (!previousRoad) {
          throw new Error("Previous Road MUST be defined");
        }

        const halfWidth = (this.numLanes * canvasProperties.laneWidth) / 2;
        const centerDist = Point.distance(this.startPoint, this.endPoint);

        const exitAngle = Point.getLineAngle(this.startPoint, this.endPoint);

        const roadStartOuter = new Point(
          this.startPoint.x +
            halfWidth * Math.cos(previousRoad.endAngle - Math.PI / 2),
          this.startPoint.y +
            halfWidth * Math.sin(previousRoad.endAngle - Math.PI / 2),
        );
        const roadStartInner = new Point(
          this.startPoint.x +
            halfWidth * Math.cos(previousRoad.endAngle + Math.PI / 2),
          this.startPoint.y +
            halfWidth * Math.sin(previousRoad.endAngle + Math.PI / 2),
        );

        const roadEndOuter = new Point(
          this.endPoint.x + halfWidth * Math.cos(exitAngle - Math.PI / 2),
          this.endPoint.y + halfWidth * Math.sin(exitAngle - Math.PI / 2),
        );
        const roadEndInner = new Point(
          this.endPoint.x + halfWidth * Math.cos(exitAngle + Math.PI / 2),
          this.endPoint.y + halfWidth * Math.sin(exitAngle + Math.PI / 2),
        );

        const outerMidpoint = Point.lerp(roadStartOuter, roadEndOuter, 0.5);
        const outerDist = Point.distance(roadStartOuter, roadEndOuter);
        const controlPointOuter = Point.getPerpendicularShift(
          outerMidpoint,
          roadEndOuter,
          1,
          (this.curveIntensity * outerDist) / centerDist,
        );

        const innerMidpoint = Point.lerp(roadStartInner, roadEndInner, 0.5);
        const innerDist = Point.distance(roadStartInner, roadEndInner);
        const controlPointInner = Point.getPerpendicularShift(
          innerMidpoint,
          roadStartInner,
          1,
          (-this.curveIntensity * innerDist) / centerDist,
        );

        this.calculatedPoints = [
          roadStartOuter,
          roadStartInner,
          roadEndOuter,
          roadEndInner,
          controlPointOuter,
          controlPointInner,
          Point.lerp(this.startPoint, this.endPoint, 0.5),
        ];

        this.endAngle = Point.getLineAngle(
          this.calculatedPoints[6],
          this.endPoint,
        );
        this.calculatedPath2D.moveTo(roadStartOuter.x, roadStartOuter.y);
        this.calculatedPath2D.quadraticCurveTo(
          controlPointOuter.x,
          controlPointOuter.y,
          roadEndOuter.x,
          roadEndOuter.y,
        );
        this.calculatedPath2D.lineTo(roadEndInner.x, roadEndInner.y);
        this.calculatedPath2D.quadraticCurveTo(
          controlPointInner.x,
          controlPointInner.y,
          roadStartInner.x,
          roadStartInner.y,
        );
        this.calculatedPath2D.lineTo(roadStartOuter.x, roadStartOuter.y);
        this.calculatedPath2D.closePath();
        break;
      }
      case "arc": {
        if (!previousRoad) {
          throw new Error("Previous Road MUST be defined");
        }

        const halfWidth = (this.numLanes * canvasProperties.laneWidth) / 2;

        const roadStartOuter = new Point(
          this.startPoint.x +
            halfWidth * Math.cos(previousRoad.endAngle - Math.PI / 2),
          this.startPoint.y +
            halfWidth * Math.sin(previousRoad.endAngle - Math.PI / 2),
        );
        const roadStartInner = new Point(
          this.startPoint.x +
            halfWidth * Math.cos(previousRoad.endAngle + Math.PI / 2),
          this.startPoint.y +
            halfWidth * Math.sin(previousRoad.endAngle + Math.PI / 2),
        );

        const roadEndOuter = new Point(
          this.endPoint.x + halfWidth * Math.cos(this.endAngle - Math.PI / 2),
          this.endPoint.y + halfWidth * Math.sin(this.endAngle - Math.PI / 2),
        );
        const roadEndInner = new Point(
          this.endPoint.x + halfWidth * Math.cos(this.endAngle + Math.PI / 2),
          this.endPoint.y + halfWidth * Math.sin(this.endAngle + Math.PI / 2),
        );

        const outerDist = Point.distance(roadStartOuter, roadEndOuter);
        const innerDist = Point.distance(roadStartInner, roadEndInner);

        const controlPoint1Outer = new Point(
          roadStartOuter.x + 0.4 * outerDist * Math.cos(previousRoad.endAngle),
          roadStartOuter.y + 0.4 * outerDist * Math.sin(previousRoad.endAngle),
        );
        const controlPoint2Outer = new Point(
          roadEndOuter.x - 0.4 * outerDist * Math.cos(this.endAngle),
          roadEndOuter.y - 0.4 * outerDist * Math.sin(this.endAngle),
        );

        const controlPoint1Inner = new Point(
          roadStartInner.x + 0.4 * innerDist * Math.cos(previousRoad.endAngle),
          roadStartInner.y + 0.4 * innerDist * Math.sin(previousRoad.endAngle),
        );
        const controlPoint2Inner = new Point(
          roadEndInner.x - 0.4 * innerDist * Math.cos(this.endAngle),
          roadEndInner.y - 0.4 * innerDist * Math.sin(this.endAngle),
        );

        this.calculatedPoints = [
          roadEndOuter,
          roadStartInner,
          roadEndOuter,
          roadEndInner,
          controlPoint1Outer,
          controlPoint2Outer,
          controlPoint1Inner,
          controlPoint2Inner,
        ];
        this.endAngle = Point.getLineAngle(
          Point.lerp(controlPoint2Inner, controlPoint2Outer, 0.5),
          this.endPoint,
        );

        this.calculatedPath2D.moveTo(roadStartOuter.x, roadStartOuter.y);
        this.calculatedPath2D.bezierCurveTo(
          controlPoint1Outer.x,
          controlPoint1Outer.y,
          controlPoint2Outer.x,
          controlPoint2Outer.y,
          roadEndOuter.x,
          roadEndOuter.y,
        );

        this.calculatedPath2D.lineTo(roadEndInner.x, roadEndInner.y);
        this.calculatedPath2D.bezierCurveTo(
          controlPoint2Inner.x,
          controlPoint2Inner.y,
          controlPoint1Inner.x,
          controlPoint1Inner.y,
          roadStartInner.x,
          roadStartInner.y,
        );
        this.calculatedPath2D.lineTo(roadStartOuter.x, roadStartOuter.y);
        this.calculatedPath2D.closePath();

        break;
      }
    }

    ctx.fillStyle = this.isSegmentVisible ? "white" : "transparent";
    ctx.fill(this.calculatedPath2D);

    this.roadIsRendered = true;

    // arrows
    if (this.arrows.enabled) {
      let roadWidth = this.numLanes * canvasProperties.laneWidth;
      let pointsToDraw = [];
      switch (this.roadType) {
        case "straight": {
          let leftEdge = Point.getPerpendicularShift(
            this.endPoint,
            this.calculatedPoints[1],
            -1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );
          let rightEdge = Point.getPerpendicularShift(
            this.endPoint,
            this.calculatedPoints[1],
            1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );

          let headingAngle = Point.getLineAngle(
            this.calculatedPoints[1],
            this.endPoint,
          );

          let leftEdgeNotch = new Point(
            leftEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            leftEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let rightEdgeNotch = new Point(
            rightEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            rightEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let pointHeadNotch = new Point(
            this.endPoint.x +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.cos(headingAngle),
            this.endPoint.y +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.sin(headingAngle),
          );

          let leftEdgeToCPAngle = Point.getLineAngle(
            leftEdgeNotch,
            this.calculatedPoints[1],
          );
          let rightEdgeToCPAngle = Point.getLineAngle(
            rightEdgeNotch,
            this.calculatedPoints[1],
          );

          let leftEdgeStart = Point.lerp(this.endPoint, leftEdgeNotch, 0.8);
          leftEdgeStart = new Point(
            leftEdgeStart.x +
              this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeStart.y +
              this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let leftEdgeEnd = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.2);
          leftEdgeEnd = new Point(
            leftEdgeEnd.x - this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeEnd.y - this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let rightEdgeStart = Point.lerp(this.endPoint, rightEdgeNotch, 0.8);
          rightEdgeStart = new Point(
            rightEdgeStart.x +
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeStart.y +
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let rightEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.2);
          rightEdgeEnd = new Point(
            rightEdgeEnd.x -
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeEnd.y -
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let centerEdgeStart = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeStart = new Point(
            centerEdgeStart.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeStart.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          let centerEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeEnd = new Point(
            centerEdgeEnd.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeEnd.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          pointsToDraw.push(this.endPoint);
          pointsToDraw.push(leftEdgeStart);
          pointsToDraw.push(leftEdgeNotch);
          pointsToDraw.push(leftEdgeEnd);

          pointsToDraw.push(centerEdgeStart);
          pointsToDraw.push(pointHeadNotch);
          pointsToDraw.push(centerEdgeEnd);

          pointsToDraw.push(rightEdgeStart);
          pointsToDraw.push(rightEdgeNotch);
          pointsToDraw.push(rightEdgeEnd);

          break;
        }
        case "merge": {
          let leftEdge = Point.getPerpendicularShift(
            this.endPoint,
            this.calculatedPoints[0],
            -1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );
          let rightEdge = Point.getPerpendicularShift(
            this.endPoint,
            this.calculatedPoints[0],
            1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );

          let headingAngle = Point.getLineAngle(
            this.calculatedPoints[0],
            this.endPoint,
          );

          let leftEdgeNotch = new Point(
            leftEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            leftEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let rightEdgeNotch = new Point(
            rightEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            rightEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let pointHeadNotch = new Point(
            this.endPoint.x +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.cos(headingAngle),
            this.endPoint.y +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.sin(headingAngle),
          );

          let leftEdgeToCPAngle = Point.getLineAngle(
            leftEdgeNotch,
            this.calculatedPoints[0],
          );
          let rightEdgeToCPAngle = Point.getLineAngle(
            rightEdgeNotch,
            this.calculatedPoints[0],
          );

          let leftEdgeStart = Point.lerp(this.endPoint, leftEdgeNotch, 0.8);
          leftEdgeStart = new Point(
            leftEdgeStart.x +
              this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeStart.y +
              this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let leftEdgeEnd = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.2);
          leftEdgeEnd = new Point(
            leftEdgeEnd.x - this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeEnd.y - this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let rightEdgeStart = Point.lerp(this.endPoint, rightEdgeNotch, 0.8);
          rightEdgeStart = new Point(
            rightEdgeStart.x +
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeStart.y +
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let rightEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.2);
          rightEdgeEnd = new Point(
            rightEdgeEnd.x -
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeEnd.y -
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let centerEdgeStart = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeStart = new Point(
            centerEdgeStart.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeStart.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          let centerEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeEnd = new Point(
            centerEdgeEnd.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeEnd.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          pointsToDraw.push(this.endPoint);
          pointsToDraw.push(leftEdgeStart);
          pointsToDraw.push(leftEdgeNotch);
          pointsToDraw.push(leftEdgeEnd);

          pointsToDraw.push(centerEdgeStart);
          pointsToDraw.push(pointHeadNotch);
          pointsToDraw.push(centerEdgeEnd);

          pointsToDraw.push(rightEdgeStart);
          pointsToDraw.push(rightEdgeNotch);
          pointsToDraw.push(rightEdgeEnd);
          break;
        }
        case "arc": {
          let leftEdge = Point.getPerpendicularShift(
            this.endPoint,
            Point.lerp(this.calculatedPoints[5], this.calculatedPoints[7], 0.5),
            -1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );

          let rightEdge = Point.getPerpendicularShift(
            this.endPoint,
            Point.lerp(this.calculatedPoints[5], this.calculatedPoints[7], 0.5),
            1,
            this.arrows.arrowWidth > 0 ? this.arrows.arrowWidth : roadWidth,
          );

          let headingAngle = this.endAngle;

          let leftEdgeNotch = new Point(
            leftEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            leftEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let rightEdgeNotch = new Point(
            rightEdge.x - this.arrows.bottomOffset * Math.cos(headingAngle),
            rightEdge.y - this.arrows.bottomOffset * Math.sin(headingAngle),
          );

          let pointHeadNotch = new Point(
            this.endPoint.x +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.cos(headingAngle),
            this.endPoint.y +
              (this.arrows.arrowHeight > 0
                ? this.arrows.arrowHeight
                : roadWidth) *
                Math.sin(headingAngle),
          );

          let leftEdgeToCPAngle = Point.getLineAngle(
            leftEdgeNotch,
            Point.lerp(this.calculatedPoints[5], this.calculatedPoints[7], 0.5),
          );
          let rightEdgeToCPAngle = Point.getLineAngle(
            rightEdgeNotch,
            Point.lerp(this.calculatedPoints[5], this.calculatedPoints[7], 0.5),
          );

          let leftEdgeStart = Point.lerp(this.endPoint, leftEdgeNotch, 0.8);
          leftEdgeStart = new Point(
            leftEdgeStart.x +
              this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeStart.y +
              this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let leftEdgeEnd = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.2);
          leftEdgeEnd = new Point(
            leftEdgeEnd.x - this.arrows.roundness * Math.cos(leftEdgeToCPAngle),
            leftEdgeEnd.y - this.arrows.roundness * Math.sin(leftEdgeToCPAngle),
          );

          let rightEdgeStart = Point.lerp(this.endPoint, rightEdgeNotch, 0.8);
          rightEdgeStart = new Point(
            rightEdgeStart.x +
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeStart.y +
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let rightEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.2);
          rightEdgeEnd = new Point(
            rightEdgeEnd.x -
              this.arrows.roundness * Math.cos(rightEdgeToCPAngle),
            rightEdgeEnd.y -
              this.arrows.roundness * Math.sin(rightEdgeToCPAngle),
          );

          let centerEdgeStart = Point.lerp(leftEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeStart = new Point(
            centerEdgeStart.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeStart.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          let centerEdgeEnd = Point.lerp(rightEdgeNotch, pointHeadNotch, 0.8);
          centerEdgeEnd = new Point(
            centerEdgeEnd.x -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.cos(headingAngle),
            centerEdgeEnd.y -
              (this.arrows.pointedTip ? 0 : this.arrows.roundness) *
                Math.sin(headingAngle),
          );

          pointsToDraw.push(this.endPoint);
          pointsToDraw.push(leftEdgeStart);
          pointsToDraw.push(leftEdgeNotch);
          pointsToDraw.push(leftEdgeEnd);

          pointsToDraw.push(centerEdgeStart);
          pointsToDraw.push(pointHeadNotch);
          pointsToDraw.push(centerEdgeEnd);

          pointsToDraw.push(rightEdgeStart);
          pointsToDraw.push(rightEdgeNotch);
          pointsToDraw.push(rightEdgeEnd);
          break;
        }
      }

      ctx.beginPath();
      ctx.moveTo(pointsToDraw[0].x, pointsToDraw[0].y);

      ctx.lineTo(pointsToDraw[1].x, pointsToDraw[1].y);

      if (this.arrows.roundness > 0) {
        ctx.quadraticCurveTo(
          pointsToDraw[2].x,
          pointsToDraw[2].y,
          pointsToDraw[3].x,
          pointsToDraw[3].y,
        );
      } else {
        ctx.lineTo(pointsToDraw[2].x, pointsToDraw[2].y);
        ctx.lineTo(pointsToDraw[3].x, pointsToDraw[3].y);
      }

      ctx.lineTo(pointsToDraw[4].x, pointsToDraw[4].y);

      if (this.arrows.roundness > 0 && !this.arrows.pointedTip) {
        ctx.quadraticCurveTo(
          pointsToDraw[5].x,
          pointsToDraw[5].y,
          pointsToDraw[6].x,
          pointsToDraw[6].y,
        );
      } else {
        ctx.lineTo(pointsToDraw[5].x, pointsToDraw[5].y);
        ctx.lineTo(pointsToDraw[6].x, pointsToDraw[6].y);
      }

      ctx.lineTo(pointsToDraw[9].x, pointsToDraw[9].y);

      if (this.arrows.roundness > 0) {
        ctx.quadraticCurveTo(
          pointsToDraw[8].x,
          pointsToDraw[8].y,
          pointsToDraw[7].x,
          pointsToDraw[7].y,
        );
      } else {
        ctx.lineTo(pointsToDraw[8].x, pointsToDraw[8].y);
        ctx.lineTo(pointsToDraw[7].x, pointsToDraw[7].y);
      }

      ctx.lineTo(pointsToDraw[0].x, pointsToDraw[0].y);
      ctx.closePath();

      ctx.fillStyle = this.isSegmentVisible ? "white" : "transparent";
      ctx.fill();
    }
  }

  isPointInRoad(point = new Point()) {
    if (!this.roadIsRendered) {
      throw new Error(
        "Road needs to be rendered before isPointInRoad can be used",
      );
    }

    return ctx.isPointInPath(this.calculatedPath2D, point.x, point.y);
  }

  drawLaneMarkings() {
    // lane markings
    if (this.numLanes > 1) {
      ctx.setLineDash([
        canvasProperties.roadMarkingSize,
        canvasProperties.roadMarkingSize,
      ]);
      ctx.strokeStyle = "black";
      ctx.lineWidth = canvasProperties.roadMarkingWidth;

      for (let i = 0; i < this.numLanes - 1; i++) {
        let laneStep = i - (this.numLanes - 1) / 2 + 0.5;

        let sign = Math.sign(laneStep);
        let dist = Math.abs(laneStep * canvasProperties.laneWidth);

        switch (this.roadType) {
          case "straight": {
            let newStart = Point.getPerpendicularShift(
              this.startPoint,
              this.endPoint,
              sign,
              dist,
            );

            let newEnd = Point.getPerpendicularShift(
              this.endPoint,
              this.startPoint,
              -sign,
              dist,
            );

            ctx.beginPath();
            ctx.moveTo(newStart.x, newStart.y);
            ctx.lineTo(newEnd.x, newEnd.y);
            ctx.stroke();
            break;
          }
          case "merge":
          case "arc": {
            ctx.beginPath();
            for (let step = 0; step <= 100; step++) {
              let t = step / 100;

              let dtBehind =
                this.roadType == "merge"
                  ? Point.quadraticLerp(
                      this.startPoint,
                      Point.lerp(
                        this.calculatedPoints[4],
                        this.calculatedPoints[5],
                        0.5,
                      ),
                      this.endPoint,
                      Math.max(0, t - 0.01),
                    )
                  : Point.cubicLerp(
                      this.startPoint,
                      Point.lerp(
                        this.calculatedPoints[4],
                        this.calculatedPoints[6],
                        0.5,
                      ),
                      Point.lerp(
                        this.calculatedPoints[5],
                        this.calculatedPoints[7],
                        0.5,
                      ),
                      this.endPoint,
                      Math.max(0, t - 0.01),
                    );
              let dtNext =
                this.roadType == "merge"
                  ? Point.quadraticLerp(
                      this.startPoint,
                      Point.lerp(
                        this.calculatedPoints[4],
                        this.calculatedPoints[5],
                        0.5,
                      ),
                      this.endPoint,
                      Math.min(1, t + 0.01),
                    )
                  : Point.cubicLerp(
                      this.startPoint,
                      Point.lerp(
                        this.calculatedPoints[4],
                        this.calculatedPoints[6],
                        0.5,
                      ),
                      Point.lerp(
                        this.calculatedPoints[5],
                        this.calculatedPoints[7],
                        0.5,
                      ),
                      this.endPoint,
                      Math.min(1, t + 0.01),
                    );

              let newPoint = Point.getPerpendicularShift(
                dtBehind,
                dtNext,
                sign,
                dist,
              );

              if (step == 0) {
                ctx.moveTo(newPoint.x, newPoint.y);
              } else {
                ctx.lineTo(newPoint.x, newPoint.y);
              }
            }
            ctx.stroke();
            break;
          }
        }
      }
    }
  }

  renderPoint(point, color) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = color || "red";
    ctx.fill();
    ctx.closePath();
  }

  // children
  newChildRoad(roadType = "straight", laneOffset = 0, properties = {}) {
    const newRoad = new Road({
      roadType: roadType,
      laneOffset: laneOffset,
      ...properties,
    });

    this.children.push(newRoad);
    return newRoad;
  }

  removeChildRoad(index) {
    if (index > this.children.length - 1 || index < 0) {
      return;
    }

    this.children.splice(index, 1);
  }

  cloneRoad() {
    const copy = new Road({
      numLanes: this.numLanes,
      roadType: this.roadType,
      endAngle: this.endAngle,
      endTransformation: new Point(
        this.endTransformation.x,
        this.endTransformation.y,
      ),
      name: this.name,
      laneOffset: this.laneOffset,
      curveIntensity: this.curveIntensity,
      arrows: { ...this.arrows },
      subpanel: { ...this.subpanel },
    });

    for (const child of this.children) {
      copy.children.push(child.cloneRoad());
    }
    return copy;
  }
}

const loadArrowPresets = async () => {
  await window.diagramLibrary.loadDiagrams((diagram) => {
    currentlySelectedDiagram =
      currentlySelectedDiagram === diagram ? null : diagram;

    document.querySelectorAll(".diagramPresetCard").forEach((card) => {
      if (
        currentlySelectedDiagram &&
        card.dataset.name == currentlySelectedDiagram.diagramName
      ) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });

    document.querySelector("#diagramPresetRename").disabled =
      !currentlySelectedDiagram;
    document.querySelector("#diagramPresetUse").disabled =
      !currentlySelectedDiagram;
    document.querySelector("#diagramPresetDelete").disabled =
      !currentlySelectedDiagram;
  });

  for (const [presetName, presetData] of Object.entries(DiagrammaticPresets)) {
    const jsonData = JSON.parse(presetData);
    const presetDataToUse = structuredClone(jsonData);

    const preset = {
      ...presetDataToUse,
      diagramName: presetName,
      isPreset: true,
    };

    const diagramPresetCard = document.createElement("button");
    diagramPresetCard.className = "diagramPresetCard";
    diagramPresetCard.dataset.name = presetName;

    const diagramPresetLabel = document.createElement("span");
    diagramPresetLabel.className = "diagramPresetLabel";
    diagramPresetLabel.textContent = `(PRESET) ${presetName}`;

    const diagramImage = document.createElement("img");
    diagramImage.src = await DiagramDrawing.diagramDataToImage(
      presetDataToUse,
      false,
    );

    diagramPresetCard.appendChild(diagramPresetLabel);
    diagramPresetCard.appendChild(diagramImage);
    document
      .querySelector("#diagramPresetGallery")
      .appendChild(diagramPresetCard);

    diagramPresetCard.addEventListener("click", () => {
      currentlySelectedDiagram =
        currentlySelectedDiagram === preset ? null : preset;

      document.querySelectorAll(".diagramPresetCard").forEach((card) => {
        card.classList.toggle(
          "selected",
          currentlySelectedDiagram &&
            card.dataset.name == currentlySelectedDiagram.diagramName,
        );
      });

      const presetSelected = currentlySelectedDiagram?.isPreset === true;
      document.querySelector("#diagramPresetRename").disabled =
        !currentlySelectedDiagram || presetSelected;
      document.querySelector("#diagramPresetUse").disabled =
        !currentlySelectedDiagram;
      document.querySelector("#diagramPresetDelete").disabled =
        !currentlySelectedDiagram || presetSelected;
    });
  }

  document.querySelectorAll(".diagramPresetCard").forEach((card) => {
    if (
      currentlySelectedDiagram &&
      card.dataset.name == currentlySelectedDiagram.diagramName
    ) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });

  const presetSelected = currentlySelectedDiagram?.isPreset === true;
  document.querySelector("#diagramPresetRename").disabled =
    !currentlySelectedDiagram || presetSelected;
  document.querySelector("#diagramPresetUse").disabled =
    !currentlySelectedDiagram;
  document.querySelector("#diagramPresetDelete").disabled =
    !currentlySelectedDiagram || presetSelected;
};

const initializeDiagramModals = () => {
  if (modelClicksInitalized) {
    return;
  }

  modelClicksInitalized = true;

  const keyboardShortcutsModal = document.querySelector(
    "#diagramKeyboardShortcuts",
  );
  const presetsModal = document.querySelector("#diagramPresets");

  for (const [selector, modal] of [
    ["#diagramKeyboardShortcutsOpen", keyboardShortcutsModal],
    ["#diagramLoadPresets", presetsModal],
  ]) {
    document.querySelector(selector).addEventListener("click", () => {
      modal.showModal();
      isModalOpen = true;
      if (modal == presetsModal) {
        loadArrowPresets();
      }
    });
  }

  const helpModal = document.querySelector("#diagramHelp");
  document
    .querySelector("#diagrammicDrawingHelp")
    .addEventListener("click", () => {
      helpModal.showModal();
      isModalOpen = true;
    });

  for (const modal of [keyboardShortcutsModal, presetsModal, helpModal]) {
    modal
      .querySelector("[data-diagram-modal-close]")
      .addEventListener("click", () => modal.close());
    modal.addEventListener("close", () => {
      isModalOpen = false;
    });
  }
};

const DiagramDrawing = (() => {
  const readForm = () => {
    const selectedRoad = editorProperties.selectedRoad;
    const parentRoad = selectedRoad && selectedRoad.previousRoad;

    canvasProperties.canvasWidth =
      DiagrammicDrawingHolder.querySelector("#diagramCanvasSize").value;
    canvasProperties.canvasHeight = canvasProperties.canvasWidth;

    canvasProperties.laneWidth =
      DiagrammicDrawingHolder.querySelector("#roadLaneSize").value;
    canvasProperties.roadMarkingSize =
      DiagrammicDrawingHolder.querySelector("#roadMarkingSize").value;
    canvasProperties.roadMarkingWidth =
      DiagrammicDrawingHolder.querySelector("#roadMarkingWidth").value;

    if (!selectedRoad) {
      renderDrawing();
      return;
    }

    selectedRoad.name = document.querySelector("#objectName").value;

    if (selectedRoad == rootRoadNode) {
      selectedRoad.roadType = "straight";
      selectedRoad.startPoint = new Point(
        parseFloat(document.querySelector("#objectStartPositionX").value),
        parseFloat(document.querySelector("#objectStartPositionY").value),
      );
    } else {
      selectedRoad.roadType = document
        .querySelector(".objectRoadType > button.selected")
        .id.includes("Merge")
        ? "merge"
        : document
              .querySelector(".objectRoadType > button.selected")
              .id.includes("Curved")
          ? "arc"
          : "straight";
    }

    selectedRoad.numLanes = Math.max(
      1,
      Math.min(
        parseInt(document.querySelector("#roadwayNumberLanes").value),
        /*parentRoad ? parentRoad.numLanes :*/ Infinity,
      ),
    );
    selectedRoad.curveIntensity = parseFloat(
      document.querySelector("#roadwayCurveIntensity").value,
    );
    selectedRoad.endTransformation = new Point(
      parseFloat(document.querySelector("#objectEndPositionX").value),
      parseFloat(document.querySelector("#objectEndPositionY").value),
    );
    selectedRoad.endAngle =
      (parseFloat(document.querySelector("#roadwayEndAngle").value) * Math.PI) /
      180;
    selectedRoad.roadMarkingsEnabled = document.querySelector(
      "#roadwayShowLaneMarkings",
    ).checked;

    selectedRoad.isSegmentVisible =
      document.querySelector("#roadwayShowRoad").checked;

    selectedRoad.arrows.enabled =
      document.querySelector("#objectShowArrow").checked;
    selectedRoad.arrows.pointedTip = document.querySelector(
      "#objectArrowPointedTip",
    ).checked;
    selectedRoad.arrows.arrowHeight = parseFloat(
      document.querySelector("#objectArrowHeight").value,
    );
    selectedRoad.arrows.arrowWidth = parseFloat(
      document.querySelector("#objectArrowWidth").value,
    );
    selectedRoad.arrows.bottomOffset = parseFloat(
      document.querySelector("#objectArrowBottomOffset").value,
    );
    selectedRoad.arrows.roundness = parseFloat(
      document.querySelector("#objectArrowRoundness").value,
    );
    selectedRoad.subpanel.enabled = document.querySelector(
      "#objectShowSubpanel",
    ).checked;
    selectedRoad.subpanel.x = parseFloat(
      document.querySelector("#objectSubpanelPositionX").value,
    );
    selectedRoad.subpanel.y = parseFloat(
      document.querySelector("#objectSubpanelPositionY").value,
    );

    const subpanelNumberInput = document.querySelector("#objectSubpanelNumber");
    if (subpanelNumberInput) {
      selectedRoad.subpanel.subpanelNumber = Number.parseInt(
        subpanelNumberInput.value,
        10,
      );
    }

    editorProperties.selectedRoad.subpanel.subpanelNumber = Number.parseInt(
      document.querySelector("#objectSubpanelNumber").value,
      10,
    );
    editorProperties.selectedRoad.subpanel.manualDirection =
      document.querySelector("#objectSubpanelDirection").value;

    editorProperties.usedSubpanelNumbers = [];

    const queue = [rootRoadNode];
    while (queue.length > 0) {
      const road = queue.pop();
      if (
        road &&
        road !== selectedRoad &&
        road.subpanel.enabled &&
        road.subpanel.subpanelNumber != -1
      ) {
        editorProperties.usedSubpanelNumbers.push(road.subpanel.subpanelNumber);
      }
      queue.push(...road.children);
    }

    updateForm();
    renderDrawing();
  };

  const updateForm = () => {
    const list = document.querySelector(".diagramObjList");
    list.innerHTML = "";

    const renderRoad = (road, depth) => {
      const button = document.createElement("button");
      button.className =
        "diagramObjectButton" +
        (road == editorProperties.selectedRoad ? " selected" : "") +
        (road == editorProperties.movingRoad ? "moving" : "");
      button.textContent = road.name;
      button.style.width = `${100 - Math.min(depth * 5, 50)}%`;

      button.addEventListener("click", () => {
        if (editorProperties.movingRoad) {
          const movingRoad = editorProperties.movingRoad;
          const oldParent = movingRoad.previousRoad;
          if (road != movingRoad && !movingRoad.children.includes(road)) {
            oldParent.removeChildRoad(oldParent.children.indexOf(movingRoad));
            road.children.push(movingRoad);
            movingRoad.laneOffset = Math.max(
              -Math.floor(road.numLanes / 2),
              Math.min(movingRoad.laneOffset, Math.floor(road.numLanes / 2)),
            );
          }

          editorProperties.selectedRoad = movingRoad;
          editorProperties.movingRoad = null;
          document.querySelector("#objectRoadMove").textContent = "Move";
          document
            .querySelector(".diagramObjectButton.selected")
            .classList.remove("moving");
          updateForm();
          renderDrawing();

          return;
        }

        editorProperties.selectedRoad = road;
        updateForm();
        renderDrawing();
      });
      list.appendChild(button);

      if (editorProperties.selectedRoad == road) {
        const addButton = document.createElement("button");
        addButton.className = "diagramObjectButton diagramObjectAddButton";
        addButton.textContent = "+ Add Road";
        addButton.style.width = `${100 - Math.min((depth + 1) * 5, 50)}%`;

        addButton.addEventListener("click", () => {
          const child = road.newChildRoad("straight", 0, {
            name: "New Road",
            numLanes: 1,
            endTransformation: new Point(
              200 * Math.cos(editorProperties.selectedRoad.endAngle),
              200 * Math.sin(editorProperties.selectedRoad.endAngle),
            ),
          });
          editorProperties.selectedRoad = child;
          updateForm();
          renderDrawing();
        });

        list.appendChild(addButton);
      }
      for (const child of road.children) {
        renderRoad(child, depth + 1);
      }
    };

    renderRoad(rootRoadNode, 0);

    DiagrammicDrawingHolder.querySelector("#diagramCanvasSize").value =
      canvasProperties.canvasWidth;
    DiagrammicDrawingHolder.querySelector("#roadLaneSize").value =
      canvasProperties.laneWidth;
    DiagrammicDrawingHolder.querySelector("#roadMarkingSize").value =
      canvasProperties.roadMarkingSize;
    DiagrammicDrawingHolder.querySelector("#roadMarkingWidth").value =
      canvasProperties.roadMarkingWidth;

    document.querySelector(".diagramObjectProperties").style.display =
      editorProperties.selectedRoad ? "" : "none";
    if (!editorProperties.selectedRoad) {
      return;
    }

    const selectedRoad = editorProperties.selectedRoad;

    document.querySelector("#objectName").value = selectedRoad.name;
    document.querySelector("#roadwayNumberLanes").value = selectedRoad.numLanes;
    document.querySelector("#roadwayCurveIntensity").value =
      selectedRoad.curveIntensity;
    document.querySelector("#objectEndPositionX").value =
      +selectedRoad.endTransformation.x.toFixed(0);
    document.querySelector("#objectEndPositionY").value =
      +selectedRoad.endTransformation.y.toFixed(0);
    document.querySelector("#roadwayEndAngle").value = +(
      (selectedRoad.endAngle * 180) /
      Math.PI
    ).toFixed(0);
    document.querySelector("#roadwayShowLaneMarkings").checked =
      selectedRoad.roadMarkingsEnabled;
    document.querySelector("#roadwayShowRoad").checked =
      selectedRoad.isSegmentVisible;

    document.querySelector("#objectShowArrow").checked =
      selectedRoad.arrows.enabled;
    document.querySelector("#objectArrowHeight").value =
      selectedRoad.arrows.arrowHeight;
    document.querySelector("#objectArrowWidth").value =
      selectedRoad.arrows.arrowWidth;
    document.querySelector("#objectArrowBottomOffset").value =
      selectedRoad.arrows.bottomOffset;
    document.querySelector("#objectArrowRoundness").value =
      selectedRoad.arrows.roundness;
    document.querySelector("#objectArrowPointedTip").checked =
      selectedRoad.arrows.pointedTip;
    document.querySelector("#objectShowSubpanel").checked =
      selectedRoad.subpanel.enabled;

    document.querySelector("#objectSubpanelPositionX").value =
      +selectedRoad.subpanel.x.toFixed(0);
    document.querySelector("#objectSubpanelPositionY").value =
      +selectedRoad.subpanel.y.toFixed(0);
    for (const button of document.querySelectorAll(
      ".objectRoadType > button",
    )) {
      button.classList.toggle(
        "selected",
        (selectedRoad.roadType == "straight" &&
          button.id.includes("Straight")) ||
          (selectedRoad.roadType == "merge" && button.id.includes("Merge")) ||
          (selectedRoad.roadType == "arc" && button.id.includes("Curved")),
      );
    }
    document.querySelector("#objectStartPositionX").style.display =
      selectedRoad == rootRoadNode ? "" : "none";
    document.querySelector("#objectStartPositionY").style.display =
      selectedRoad == rootRoadNode ? "" : "none";
    if (selectedRoad == rootRoadNode) {
      document.querySelector("#objectStartPositionX").value =
        +selectedRoad.startPoint.x.toFixed(0);
      document.querySelector("#objectStartPositionY").value =
        +selectedRoad.startPoint.y.toFixed(0);
    }
    document.querySelector('label[for="objectStartPositionX"').style.display =
      selectedRoad == rootRoadNode ? "" : "none";
    document.querySelector(".objectStartPositionDivider").style.display =
      selectedRoad == rootRoadNode ? "" : "none";

    document.querySelector("#roadwayCurveIntensity").style.display =
      selectedRoad.roadType == "merge" ? "" : "none";
    document.querySelector('label[for="roadwayCurveIntensity"]').style.display =
      selectedRoad.roadType == "merge" ? "" : "none";
    document.querySelector("#roadwayEndAngle").style.display =
      selectedRoad.roadType == "arc" ? "" : "none";
    document.querySelector('label[for="roadwayEndAngle"]').style.display =
      selectedRoad.roadType == "arc" ? "" : "none";
    document.querySelector("#objectArrowHeight").style.display = selectedRoad
      .arrows.enabled
      ? ""
      : "none";
    document.querySelector('label[for="objectArrowHeight"]').style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector("#objectArrowWidth").style.display = selectedRoad
      .arrows.enabled
      ? ""
      : "none";
    document.querySelector('label[for="objectArrowWidth"]').style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector("#objectArrowBottomOffset").style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector(
      'label[for="objectArrowBottomOffset"]',
    ).style.display = selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector("#objectArrowRoundness").style.display = selectedRoad
      .arrows.enabled
      ? ""
      : "none";
    document.querySelector("#objectArrowPointedTip").style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector('label[for="objectArrowPointedTip"]').style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector('label[for="objectArrowRoundness"]').style.display =
      selectedRoad.arrows.enabled ? "" : "none";
    document.querySelector("#objectSubpanelNumber").style.display = selectedRoad
      .subpanel.enabled
      ? ""
      : "none";
    document.querySelector("#objectSubpanelAdd").style.display = selectedRoad
      .subpanel.enabled
      ? ""
      : "none";
    document.querySelector("#objectSubpanelPositionX").style.display =
      selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector(
      'label[for="objectSubpanelPositionX"]',
    ).style.display = selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector('label[for="objectSubpanelNumber"]').style.display =
      selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector(
      'label[for="objectSubpanelDirection"]',
    ).style.display = selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector("#objectSubpanelDirection").style.display =
      selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector("#objectSubpanelPositionY").style.display =
      selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector(".objectSubpanelPositionDivider").style.display =
      selectedRoad.subpanel.enabled ? "" : "none";
    document.querySelector(".objectSubpanelPositionDivider2").style.display =
      selectedRoad.subpanel.enabled ? "" : "none";

    let availableNumbers = [];
    for (
      let index = 0;
      index < app.getCurrentPanel().sign.subPanels.length;
      index++
    ) {
      if (
        !editorProperties.usedSubpanelNumbers.includes(index) ||
        index === selectedRoad.subpanel.subpanelNumber
      ) {
        availableNumbers.push(index);
      }
    }

    document.querySelector("#objectSubpanelNumber").innerHTML = "";
    lib.appendOption(document.querySelector("#objectSubpanelNumber"), -1, {
      selected: selectedRoad.subpanel.subpanelNumber == -1,
      text: "None",
    });

    for (let index = 0; index < availableNumbers.length; index++) {
      lib.appendOption(
        document.querySelector("#objectSubpanelNumber"),
        availableNumbers[index],
        {
          selected:
            selectedRoad.subpanel.subpanelNumber == availableNumbers[index],
          text: "Subpanel " + (availableNumbers[index] + 1),
        },
      );
    }

    if (
      !availableNumbers.includes(selectedRoad.subpanel.subpanelNumber) &&
      selectedRoad.subpanel.subpanelNumber != -1
    ) {
      lib.appendOption(
        document.querySelector("#objectSubpanelNumber"),
        selectedRoad.subpanel.subpanelNumber,
        {
          selected: true,
          text:
            "(Preset) Subpanel " + (selectedRoad.subpanel.subpanelNumber + 1),
        },
      );
    }

    document.querySelector("#objectSubpanelDirection").value =
      selectedRoad.subpanel.manualDirection;
  };

  const renderEditorDrawing = () => {
    const roadQueue = [rootRoadNode];
    const canvasScale = canvasProperties.canvasWidth / 900;

    while (roadQueue.length > 0) {
      const road = roadQueue.pop();
      if (!road || !road.subpanel || !road.subpanel.enabled) {
        if (road && road.children) {
          roadQueue.push(...road.children);
        }
        continue;
      }

      if (road.subpanel.subpanelNumber !== -1) {
        const subpanelLabel = String(road.subpanel.subpanelNumber + 1);
        const textX = road.subpanel.x;
        const textY = road.subpanel.y;

        ctx.save();
        ctx.font = `${28 * canvasScale}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4 * canvasScale;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#ffffff";
        ctx.strokeText(subpanelLabel, textX, textY);
        ctx.fillText(subpanelLabel, textX, textY);
        ctx.restore();
      }

      if (road.children) {
        roadQueue.push(...road.children);
      }
    }

    if (!editorProperties.selectedRoad) {
      return;
    }

    let selectedRoad = editorProperties.selectedRoad;
    // outline
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.stroke(selectedRoad.calculatedPath2D);

    // start/end points
    ctx.fillStyle = "#00FF00";

    ctx.beginPath();

    ctx.arc(
      selectedRoad.startPoint.x,
      selectedRoad.startPoint.y,
      10 * canvasScale,
      0,
      2 * Math.PI,
    );
    editorProperties.points.startPoint = selectedRoad.startPoint;
    ctx.fill();

    ctx.fillStyle = "#FF0000";

    ctx.beginPath();
    ctx.arc(
      selectedRoad.endPoint.x,
      selectedRoad.endPoint.y,
      10 * canvasScale,
      0,
      2 * Math.PI,
    );

    editorProperties.points.endPoint = selectedRoad.endPoint;
    ctx.fill();

    // road arrow
    let arrowLength = 135 * canvasScale;

    ctx.beginPath();
    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 12 * canvasScale;
    ctx.lineCap = "round";

    ctx.moveTo(
      selectedRoad.endPoint.x +
        45 * canvasScale * Math.cos(selectedRoad.endAngle),
      selectedRoad.endPoint.y +
        45 * canvasScale * Math.sin(selectedRoad.endAngle),
    );

    ctx.lineTo(
      selectedRoad.endPoint.x + arrowLength * Math.cos(selectedRoad.endAngle),
      selectedRoad.endPoint.y + arrowLength * Math.sin(selectedRoad.endAngle),
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      selectedRoad.endPoint.x + arrowLength * Math.cos(selectedRoad.endAngle),
      selectedRoad.endPoint.y + arrowLength * Math.sin(selectedRoad.endAngle),
    );

    ctx.lineTo(
      selectedRoad.endPoint.x +
        arrowLength * Math.cos(selectedRoad.endAngle) +
        25 * canvasScale * Math.cos(selectedRoad.endAngle - (3 * Math.PI) / 4),
      selectedRoad.endPoint.y +
        arrowLength * Math.sin(selectedRoad.endAngle) +
        25 * canvasScale * Math.sin(selectedRoad.endAngle - (3 * Math.PI) / 4),
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
      selectedRoad.endPoint.x + arrowLength * Math.cos(selectedRoad.endAngle),
      selectedRoad.endPoint.y + arrowLength * Math.sin(selectedRoad.endAngle),
    );
    ctx.lineTo(
      selectedRoad.endPoint.x +
        arrowLength * Math.cos(selectedRoad.endAngle) +
        25 * canvasScale * Math.cos(selectedRoad.endAngle + (3 * Math.PI) / 4),
      selectedRoad.endPoint.y +
        arrowLength * Math.sin(selectedRoad.endAngle) +
        25 * canvasScale * Math.sin(selectedRoad.endAngle + (3 * Math.PI) / 4),
    );

    editorProperties.points.arrow = new Point(
      selectedRoad.endPoint.x + arrowLength * Math.cos(selectedRoad.endAngle),
      selectedRoad.endPoint.y + arrowLength * Math.sin(selectedRoad.endAngle),
    );
    ctx.stroke();

    // shift
    let shiftArr = { shiftLeft: -1, shiftRight: 1 };
    for (let shift in shiftArr) {
      if (
        selectedRoad.previousRoad &&
        Math.abs(
          selectedRoad.laneOffset +
            shiftArr[shift] +
            (Road.checkOffset(
              selectedRoad.numLanes,
              selectedRoad.previousRoad.numLanes,
            )
              ? 0.5
              : 0),
        ) <=
          Math.max(
            0,
            (selectedRoad.previousRoad.numLanes - selectedRoad.numLanes) / 2,
          )
      ) {
        let startAngle = selectedRoad.previousRoad.endAngle + Math.PI / 2;
        let arrowLength = 32 * canvasScale;
        let arrowHead = 13 * canvasScale;

        let arrowPoint = new Point(
          selectedRoad.startPoint.x +
            shiftArr[shift] * 40 * canvasScale * Math.cos(startAngle),
          selectedRoad.startPoint.y +
            shiftArr[shift] * 40 * canvasScale * Math.sin(startAngle),
        );

        let arrowTip = new Point(
          arrowPoint.x + shiftArr[shift] * arrowLength * Math.cos(startAngle),
          arrowPoint.y + shiftArr[shift] * arrowLength * Math.sin(startAngle),
        );

        ctx.beginPath();
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 8 * canvasScale;
        ctx.lineCap = "round";
        ctx.moveTo(
          arrowPoint.x -
            shiftArr[shift] * arrowLength * 0.45 * Math.cos(startAngle),
          arrowPoint.y -
            shiftArr[shift] * arrowLength * 0.45 * Math.sin(startAngle),
        );
        ctx.lineTo(arrowTip.x, arrowTip.y);
        ctx.moveTo(
          arrowTip.x -
            shiftArr[shift] * arrowHead * Math.cos(startAngle - Math.PI / 4),
          arrowTip.y -
            shiftArr[shift] * arrowHead * Math.sin(startAngle - Math.PI / 4),
        );
        ctx.lineTo(arrowTip.x, arrowTip.y);
        ctx.lineTo(
          arrowTip.x -
            shiftArr[shift] * arrowHead * Math.cos(startAngle + Math.PI / 4),
          arrowTip.y -
            shiftArr[shift] * arrowHead * Math.sin(startAngle + Math.PI / 4),
        );
        ctx.stroke();
        ctx.lineCap = "";
        editorProperties.points[shift] = arrowPoint;
      } else {
        editorProperties.points[shift] = null;
      }
    }

    if (selectedRoad.roadType == "arc") {
      // rotate point
      ctx.save();
      ctx.translate(selectedRoad.endPoint.x, selectedRoad.endPoint.y);
      ctx.rotate(selectedRoad.endAngle + Math.PI / 2);
      ctx.drawImage(
        rotateImg,
        (-100 * canvasScale) / 2,
        (-100 * canvasScale) / 2,
        100 * canvasScale,
        100 * canvasScale,
      );
      ctx.restore();
      editorProperties.points.rotatePoint = new Point(
        selectedRoad.endPoint.x +
          25 * canvasScale * Math.cos(selectedRoad.endAngle),
        selectedRoad.endPoint.y +
          25 * canvasScale * Math.sin(selectedRoad.endAngle),
      );
    } else {
      editorProperties.points.rotatePoint = null;
    }

    if (selectedRoad.subpanel.enabled) {
      const subpanelX = selectedRoad.subpanel.x;
      const subpanelY = selectedRoad.subpanel.y;
      const direction = selectedRoad.subpanel.direction || "right";
      const arrowSize = 14 * canvasScale;
      const strokeSize = 30 * canvasScale;

      ctx.beginPath();
      ctx.moveTo(subpanelX - strokeSize / 2, subpanelY - strokeSize / 2);
      ctx.lineTo(subpanelX + strokeSize / 2, subpanelY + strokeSize / 2);
      ctx.moveTo(subpanelX - strokeSize / 2, subpanelY + strokeSize / 2);
      ctx.lineTo(subpanelX + strokeSize / 2, subpanelY - strokeSize / 2);
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 4;
      ctx.stroke();

      const arrowHead = {
        left: {
          base: new Point(subpanelX - arrowSize, subpanelY),
          points: [
            new Point(subpanelX - arrowSize * 1.5, subpanelY - arrowSize * 0.7),
            new Point(subpanelX - arrowSize * 1.5, subpanelY + arrowSize * 0.7),
            new Point(subpanelX - 4 * canvasScale, subpanelY),
          ],
        },
        right: {
          base: new Point(subpanelX + arrowSize, subpanelY),
          points: [
            new Point(subpanelX + arrowSize * 1.5, subpanelY - arrowSize * 0.7),
            new Point(subpanelX + arrowSize * 1.5, subpanelY + arrowSize * 0.7),
            new Point(subpanelX + 4 * canvasScale, subpanelY),
          ],
        },
        top: {
          base: new Point(subpanelX, subpanelY - arrowSize),
          points: [
            new Point(subpanelX - arrowSize * 0.7, subpanelY - arrowSize * 1.5),
            new Point(subpanelX + arrowSize * 0.7, subpanelY - arrowSize * 1.5),
            new Point(subpanelX, subpanelY - 4 * canvasScale),
          ],
        },
        bottom: {
          base: new Point(subpanelX, subpanelY + arrowSize),
          points: [
            new Point(subpanelX - arrowSize * 0.7, subpanelY + arrowSize * 1.5),
            new Point(subpanelX + arrowSize * 0.7, subpanelY + arrowSize * 1.5),
            new Point(subpanelX, subpanelY + 4 * canvasScale),
          ],
        },
      }[direction];

      ctx.beginPath();
      ctx.moveTo(arrowHead.points[0].x, arrowHead.points[0].y);
      ctx.lineTo(arrowHead.points[1].x, arrowHead.points[1].y);
      ctx.lineTo(arrowHead.points[2].x, arrowHead.points[2].y);
      ctx.closePath();
      ctx.fillStyle = "#ffff00";
      ctx.fill();

      editorProperties.points.subpanelPoint = new Point(
        selectedRoad.subpanel.x,
        selectedRoad.subpanel.y,
      );
    } else {
      editorProperties.points.subpanelPoint = null;
    }
  };

  const renderDrawing = (previewImage = false) => {
    ctx.clearRect(
      0,
      0,
      canvasProperties.canvasWidth,
      canvasProperties.canvasHeight,
    );
    canvasElement.width = canvasProperties.canvasWidth;
    canvasElement.height = canvasProperties.canvasHeight;

    let queue = [{ node: rootRoadNode, parentNode: null }];
    let hasLaneMarkings = [];
    let hasSubPanels = [];
    while (queue.length > 0) {
      let nextRoad = queue.pop();
      if (nextRoad.parentNode) {
        nextRoad.node.laneOffset = Math.max(
          -Math.ceil(
            (nextRoad.parentNode.numLanes - nextRoad.node.numLanes) / 2,
          ),
          Math.min(
            nextRoad.node.laneOffset,
            Math.floor(
              (nextRoad.parentNode.numLanes - nextRoad.node.numLanes) / 2,
            ),
          ),
        );
      }

      nextRoad.node.drawRoadSegment(nextRoad.parentNode);

      if (nextRoad.node.numLanes > 1 && nextRoad.node.roadMarkingsEnabled) {
        hasLaneMarkings.push(nextRoad.node);
      }

      if (nextRoad.node.subpanel.enabled) {
        hasSubPanels.push(nextRoad.node);
      }

      if (nextRoad.node.children.length > 0) {
        for (const child of nextRoad.node.children) {
          queue.push({ node: child, parentNode: nextRoad.node });
        }
      }
    }

    for (const node of hasLaneMarkings) {
      node.drawLaneMarkings();
    }

    for (const node of hasSubPanels) {
      if (node.subpanel.manualDirection == "auto") {
        node.subpanel.direction = null;
        for (const direction of ["left", "right", "top", "bottom"]) {
          let hitDetected = false;
          for (let offset = 0; offset <= 250; offset += 5) {
            let samplePoint = new Point(node.subpanel.x, node.subpanel.y);

            if (direction === "left") samplePoint.x -= offset;
            if (direction === "right") samplePoint.x += offset;
            if (direction === "top") samplePoint.y -= offset;
            if (direction === "bottom") samplePoint.y += offset;

            const queue = [rootRoadNode];
            while (queue.length > 0) {
              const candidateRoad = queue.pop();
              if (
                ctx.isPointInPath(
                  candidateRoad.calculatedPath2D,
                  samplePoint.x,
                  samplePoint.y,
                )
              ) {
                node.subpanel.direction = {
                  left: "right",
                  right: "left",
                  top: "bottom",
                  bottom: "top",
                }[direction];
                hitDetected = true;
                break;
              }

              queue.push(...candidateRoad.children);
            }

            if (hitDetected) break;
          }
          if (hitDetected) break;
        }

        if (!node.subpanel.direction) {
          node.subpanel.direction = "left";
        }
      } else {
        node.subpanel.direction = node.subpanel.manualDirection;
      }
    }

    if (isEditorOpen && !previewImage) {
      renderEditorDrawing();
    }
  };

  const resetEditorState = () => {
    editorProperties.selectedRoad = null;
    editorProperties.movingRoad = null;
    editorProperties.cursorState = "NONE";
    editorProperties.dragItem = "NONE";
    editorProperties.startDragPoint = null;
    editorProperties.usedSubpanelNumbers = [];
    editorProperties.points.startPoint = null;
    editorProperties.points.endPoint = null;
    editorProperties.points.arrow = null;
    editorProperties.points.rotatePoint = null;
    editorProperties.points.shiftLeft = null;
    editorProperties.points.shiftRight = null;
    editorProperties.points.subpanelPoint = null;
    document.querySelector("#diagramFileName").value = "";
    document.body.style.cursor = "";
    ctx.clearRect(
      0,
      0,
      canvasProperties.canvasWidth,
      canvasProperties.canvasHeight,
    );
    rootRoadNode = null;
  };

  const closeDraw = (returnValue = null) => {
    deleteEditorConnections();
    resetEditorState();
    isEditorOpen = false;

    document.querySelector("#diagrammicDrawing").close();
    document.querySelector("#modalHolder").style.display = "none";
    isModalOpen = false;

    if (resolvePromptDraw) {
      resolvePromptDraw(returnValue);
      resolvePromptDraw = null;
    }
  };

  const promptDraw = (returnMethod, promptPresets, exisitingData) => {
    if (resolvePromptDraw) {
      closeDraw();
    } else {
      deleteEditorConnections();
    }

    resetEditorState();
    isEditorOpen = true;

    return new Promise((resolve) => {
      resolvePromptDraw = resolve;

      if (exisitingData && Object.keys(exisitingData).length != 0) {
        loadDiagram(exisitingData, false);
      } else {
        rootRoadNode = new Road({
          name: "Main Road",
          numLanes: 2,
          roadType: "straight",
          startPoint: new Point(
            canvasProperties.canvasWidth / 2,
            canvasProperties.canvasHeight - 50,
          ),
          endTransformation: new Point(0, -200),
        });
      }

      document.querySelector("#modalHolder").style.display = "flex";
      DiagrammicDrawingHolder.showModal();

      editorConnections.dragOrClickStart = trackEditorConnection(
        window,
        "pointerdown",
        (event) => {
          const rect = canvasElement.getBoundingClientRect();
          const canvasX =
            (event.x - rect.left) * (canvasElement.width / rect.width);
          const canvasY =
            (event.y - rect.top) * (canvasElement.width / rect.width);

          let editorScale = canvasElement.width / 900;

          if (
            canvasX < 0 ||
            canvasY < 0 ||
            canvasX > canvasElement.width ||
            canvasY > canvasElement.width
          ) {
            return;
          }

          if (editorProperties.cursorState != "NONE") {
            return;
          }

          if (isModalOpen) {
            return;
          }

          if (editorProperties.selectedRoad) {
            let selectedRoad = editorProperties.selectedRoad;
            if (
              (editorProperties.points.shiftLeft &&
                Point.distance(
                  new Point(canvasX, canvasY),
                  editorProperties.points.shiftLeft,
                ) <=
                  28 * editorScale) ||
              (editorProperties.points.shiftRight &&
                Point.distance(
                  new Point(canvasX, canvasY),
                  editorProperties.points.shiftRight,
                ) <=
                  28 * editorScale)
            ) {
              return;
            }

            // drag elements
            if (
              editorProperties.points.subpanelPoint &&
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.subpanelPoint,
              ) <=
                25 * editorScale
            ) {
              editorProperties.dragItem = "SUBPANEL_POINT";
              editorProperties.initialTransformation = new Point(
                selectedRoad.subpanel.x,
                selectedRoad.subpanel.y,
              );
            } else if (
              editorProperties.points.rotatePoint &&
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.rotatePoint,
              ) <=
                12 * editorScale
            ) {
              editorProperties.dragItem = "ROTATE";
            } else if (
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.arrow,
              ) <=
              80 * editorScale
            ) {
              editorProperties.dragItem = "ARROW";
              editorProperties.initialTransformation = new Point(
                selectedRoad.endTransformation.x,
                selectedRoad.endTransformation.y,
              );
            } else if (
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.endPoint,
              ) <=
              30 * editorScale
            ) {
              editorProperties.dragItem = "END_POINT";
              editorProperties.initialTransformation = new Point(
                selectedRoad.endTransformation.x,
                selectedRoad.endTransformation.y,
              );
            } else if (
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.startPoint,
              ) <=
              30 * editorScale
            ) {
              editorProperties.dragItem = "START_POINT";

              if (selectedRoad == rootRoadNode) {
                editorProperties.initialTransformation = new Point(
                  selectedRoad.startPoint.x,
                  selectedRoad.startPoint.y,
                );
              } else if (selectedRoad.previousRoad) {
                editorProperties.initialTransformation = new Point(
                  selectedRoad.previousRoad.endTransformation.x,
                  selectedRoad.previousRoad.endTransformation.y,
                );
              }
            } else {
              editorProperties.dragItem = "NONE";
            }

            if (editorProperties.dragItem != "NONE") {
              editorProperties.cursorState = "DRAG";
              editorProperties.startDragPoint = new Point(canvasX, canvasY);
              return;
            }
          }

          // select new road
          let queue = [{ node: rootRoadNode, parentNode: null }];
          let newSelect = null;

          while (queue.length > 0) {
            let nextRoad = queue.pop();
            if (nextRoad.node.isPointInRoad(new Point(canvasX, canvasY))) {
              newSelect = nextRoad.node;
              break;
            }

            if (nextRoad.node.children.length > 0) {
              for (const child of nextRoad.node.children) {
                queue.push({ node: child, parentNode: nextRoad.node });
              }
            }
          }

          if (editorProperties.selectedRoad == newSelect || newSelect == null) {
            editorProperties.selectedRoad = null;
            updateForm();
          } else {
            editorProperties.selectedRoad = newSelect;
            updateForm();
          }

          renderDrawing();
        },
      );

      editorConnections.dragMove = trackEditorConnection(
        window,
        "pointermove",
        (event) => {
          const rect = canvasElement.getBoundingClientRect();
          const canvasX =
            (event.x - rect.left) * (canvasElement.width / rect.width);
          const canvasY =
            (event.y - rect.top) * (canvasElement.width / rect.width);

          document.querySelector("#debugEditor").textContent =
            "X/Y: " + canvasX.toFixed(0) + "," + canvasY.toFixed(0);

          // mouse over events
          let editorScale = canvasProperties.canvasHeight / 900;
          if (
            editorProperties.selectedRoad &&
            ((editorProperties.points.rotatePoint &&
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.rotatePoint,
              ) <=
                12 * editorScale) ||
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.arrow,
              ) <=
                80 * editorScale ||
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.endPoint,
              ) <=
                30 * editorScale ||
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points.startPoint,
              ) <=
                30 * editorScale ||
              (editorProperties.points.shiftLeft &&
                Point.distance(
                  new Point(canvasX, canvasY),
                  editorProperties.points.shiftLeft,
                ) <=
                  28 * editorScale) ||
              (editorProperties.points.shiftRight &&
                Point.distance(
                  new Point(canvasX, canvasY),
                  editorProperties.points.shiftRight,
                ) <=
                  28 * editorScale) ||
              (editorProperties.points.subpanelPoint &&
                Point.distance(
                  new Point(canvasX, canvasY),
                  editorProperties.points.subpanelPoint,
                ) <=
                  25 * editorScale))
          ) {
            document.body.style.cursor = "pointer";
          } else {
            document.body.style.cursor = "";
          }

          if (editorProperties.cursorState != "DRAG") {
            return;
          }

          if (editorProperties.selectedRoad == null) {
            return;
          }
          selectedRoad = editorProperties.selectedRoad;

          let transformation = new Point(
            canvasX - editorProperties.startDragPoint.x,
            canvasY - editorProperties.startDragPoint.y,
          );
          if (editorProperties.dragItem == "ARROW") {
            let distance = Point.distance(
              new Point(canvasX, canvasY),
              editorProperties.startDragPoint,
            );

            let dx = canvasX - editorProperties.startDragPoint.x;
            let dy = canvasY - editorProperties.startDragPoint.y;
            let dirX = Math.cos(selectedRoad.endAngle);
            let dirY = Math.sin(selectedRoad.endAngle);
            let sign = dx * dirX + dy * dirY;

            let newVal = new Point(
              editorProperties.initialTransformation.x +
                Math.sign(sign) * distance * Math.cos(selectedRoad.endAngle),
              editorProperties.initialTransformation.y +
                Math.sign(sign) * distance * Math.sin(selectedRoad.endAngle),
            );

            if (
              Point.distance(
                selectedRoad.startPoint,
                new Point(
                  selectedRoad.startPoint.x + newVal.x,
                  selectedRoad.startPoint.y + newVal.y,
                ),
              ) <= 70
            ) {
              return;
            }

            selectedRoad.endTransformation = newVal;
          } else if (editorProperties.dragItem == "END_POINT") {
            let newVal = new Point(
              editorProperties.initialTransformation.x + transformation.x,
              editorProperties.initialTransformation.y + transformation.y,
            );

            if (
              Point.distance(
                selectedRoad.startPoint,
                new Point(
                  selectedRoad.startPoint.x + newVal.x,
                  selectedRoad.startPoint.y + newVal.y,
                ),
              ) <= 70
            ) {
              return;
            }

            selectedRoad.endTransformation = newVal;
          } else if (editorProperties.dragItem == "START_POINT") {
            if (selectedRoad == rootRoadNode) {
              selectedRoad.startPoint = new Point(
                editorProperties.initialTransformation.x + transformation.x,
                editorProperties.initialTransformation.y + transformation.y,
              );
            } else if (selectedRoad.previousRoad) {
              let newVal = new Point(
                editorProperties.initialTransformation.x + transformation.x,
                editorProperties.initialTransformation.y + transformation.y,
              );

              if (
                Point.distance(
                  selectedRoad.previousRoad.startPoint,
                  new Point(
                    selectedRoad.previousRoad.startPoint.x + newVal.x,
                    selectedRoad.previousRoad.startPoint.y + newVal.y,
                  ),
                ) <= 70
              ) {
                return;
              }

              selectedRoad.previousRoad.endTransformation = newVal;
            }
          } else if (editorProperties.dragItem == "ROTATE") {
            selectedRoad.endAngle = Math.atan2(
              canvasY - editorProperties.points.endPoint.y,
              canvasX - editorProperties.points.endPoint.x,
            );
          } else if (editorProperties.dragItem == "SUBPANEL_POINT") {
            selectedRoad.subpanel.x =
              editorProperties.initialTransformation.x + transformation.x;
            selectedRoad.subpanel.y =
              editorProperties.initialTransformation.y + transformation.y;
          }

          updateForm();
          renderDrawing();
        },
      );

      editorConnections.dragRelease = trackEditorConnection(
        window,
        "pointerup",
        (event) => {
          if (editorProperties.cursorState == "DRAG") {
            editorProperties.dragItem = "NONE";
            editorProperties.cursorState = "NONE";
            renderDrawing();

            return;
          }

          if (!editorProperties.selectedRoad) {
            return;
          }

          let rect = canvasElement.getBoundingClientRect();
          let canvasX =
            (event.x - rect.left) * (canvasElement.width / rect.width);
          let canvasY =
            (event.y - rect.top) * (canvasElement.width / rect.width);

          let editorScale = canvasElement.width / 900;
          let selectedRoad = editorProperties.selectedRoad;

          let shiftArr = { shiftLeft: -1, shiftRight: 1 };
          for (const shift in shiftArr) {
            if (
              editorProperties.points[shift] &&
              Point.distance(
                new Point(canvasX, canvasY),
                editorProperties.points[shift],
              ) <=
                28 * editorScale &&
              Math.abs(
                selectedRoad.laneOffset +
                  shiftArr[shift] +
                  (Road.checkOffset(
                    selectedRoad.numLanes,
                    selectedRoad.previousRoad.numLanes,
                  )
                    ? 0.5
                    : 0),
              ) <=
                Math.max(
                  0,
                  (selectedRoad.previousRoad.numLanes - selectedRoad.numLanes) /
                    2,
                )
            ) {
              selectedRoad.laneOffset += shiftArr[shift];
              renderDrawing();
            }
          }
        },
      );

      editorConnections.roadMove = trackEditorConnection(
        document.querySelector("#objectRoadMove"),
        "click",
        () => {
          if (editorProperties.movingRoad) {
            editorProperties.movingRoad = null;
            document.querySelector("#objectRoadMove").textContent = "Move";
            document
              .querySelector(".diagramObjectButton.selected")
              .classList.remove("moving");
          } else if (
            editorProperties.selectedRoad &&
            editorProperties.selectedRoad != rootRoadNode
          ) {
            editorProperties.movingRoad = editorProperties.selectedRoad;
            document.querySelector("#objectRoadMove").textContent = "Cancel";
            document
              .querySelector(".diagramObjectButton.selected")
              .classList.add("moving");
          }
        },
      );

      editorConnections.roadDuplicate = trackEditorConnection(
        document.querySelector("#objectRoadDuplicate"),
        "click",
        () => {
          let selectedRoad = editorProperties.selectedRoad;
          let parentRoad = selectedRoad && selectedRoad.previousRoad;
          if (!selectedRoad || selectedRoad == rootRoadNode) {
            return;
          }

          let duplicate = selectedRoad.cloneRoad();
          parentRoad.children.push(duplicate);
          editorProperties.selectedRoad = duplicate;

          updateForm();
          renderDrawing();
        },
      );

      editorConnections.roadDelete = trackEditorConnection(
        document.querySelector("#objectRoadDelete"),
        "click",
        () => {
          let selectedRoad = editorProperties.selectedRoad;
          let parentRoad = selectedRoad && selectedRoad.previousRoad;
          if (!selectedRoad || selectedRoad == rootRoadNode) {
            return;
          }

          parentRoad.removeChildRoad(parentRoad.children.indexOf(selectedRoad));
          editorProperties.selectedRoad = parentRoad;

          updateForm();
          renderDrawing();
        },
      );

      editorConnections.reset = trackEditorConnection(
        document.querySelector("#diagramReset"),
        "click",
        () => {
          if (confirm("Are you sure you want to reset the diagram?")) {
            rootRoadNode = new Road({
              name: "Main Road",
              numLanes: 2,
              roadType: "straight",
              startPoint: new Point(
                canvasProperties.canvasWidth / 2,
                canvasProperties.canvasHeight - 50,
              ),
              endTransformation: new Point(0, -200),
            });
            editorProperties.selectedRoad = null;
            updateForm();
            renderDrawing();
          }
        },
      );

      editorConnections.keyboardInput = trackEditorConnection(
        window,
        "keydown",
        (event) => {
          if (isModalOpen) {
            return;
          }

          let selectedRoad = editorProperties.selectedRoad;
          let parentRoad = selectedRoad && selectedRoad.previousRoad;

          const rect = canvasElement.getBoundingClientRect();
          const canvasX =
            (event.x - rect.left) * (canvasElement.width / rect.width);
          const canvasY =
            (event.y - rect.top) * (canvasElement.width / rect.width);

          if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            return;
          }

          if (canvasX > canvasElement.width || canvasY > canvasElement.height) {
            return;
          }

          // delete
          if (
            event.key == "Delete" ||
            event.key == "Backspace" ||
            event.key == "-" ||
            event.key == "_"
          ) {
            if (!selectedRoad || selectedRoad == rootRoadNode) {
              return;
            }

            parentRoad.removeChildRoad(
              parentRoad.children.indexOf(selectedRoad),
            );
            editorProperties.selectedRoad = parentRoad;

            updateForm();
            renderDrawing();
            return;
          }

          // unselect
          if (event.key == "Escape") {
            if (editorProperties.movingRoad) {
              editorProperties.movingRoad = null;
              document.querySelector("#objectRoadMove").textContent = "Move";
              document
                .querySelector(".diagramObjectButton.selected")
                .classList.remove("moving");
            }

            editorProperties.selectedRoad = null;
            updateForm();
            renderDrawing();
            return;
          }

          // new road
          if (
            (event.key == "=" || event.key == "+") &&
            editorProperties.selectedRoad
          ) {
            const child = editorProperties.selectedRoad.newChildRoad(
              "straight",
              0,
              {
                name: "New Road",
                numLanes: 1,
                endTransformation: new Point(
                  200 * Math.cos(editorProperties.selectedRoad.endAngle),
                  200 * Math.sin(editorProperties.selectedRoad.endAngle),
                ),
              },
            );
            editorProperties.selectedRoad = child;
            updateForm();
            renderDrawing();
          }

          // shift left/right
          let shiftArr = { ArrowLeft: -1, ArrowRight: 1 };
          for (let shift in shiftArr) {
            if (
              event.key == shift &&
              editorProperties.selectedRoad &&
              editorProperties.selectedRoad.previousRoad
            ) {
              if (
                Math.abs(
                  editorProperties.selectedRoad.laneOffset +
                    shiftArr[shift] +
                    (Road.checkOffset(
                      editorProperties.selectedRoad.numLanes,
                      editorProperties.selectedRoad.previousRoad.numLanes,
                    )
                      ? 0.5
                      : 0),
                ) <=
                Math.max(
                  0,
                  (editorProperties.selectedRoad.previousRoad.numLanes -
                    editorProperties.selectedRoad.numLanes) /
                    2,
                )
              ) {
                editorProperties.selectedRoad.laneOffset += shiftArr[shift];
                renderDrawing();
                return;
              }
            }
          }

          // move
          if (event.key.toUpperCase() == "W" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x,
              editorProperties.selectedRoad.endTransformation.y -
                (event.shiftKey ? 1 : 5),
            );

            updateForm();
            renderDrawing();
            return;
          }

          if (event.key.toUpperCase() == "A" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x -
                (event.shiftKey ? 1 : 5),
              editorProperties.selectedRoad.endTransformation.y,
            );

            updateForm();
            renderDrawing();
            return;
          }

          if (event.key.toUpperCase() == "S" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x,
              editorProperties.selectedRoad.endTransformation.y +
                (event.shiftKey ? 1 : 5),
            );

            updateForm();
            renderDrawing();
            return;
          }

          if (event.key.toUpperCase() == "D" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x +
                (event.shiftKey ? 1 : 5),
              editorProperties.selectedRoad.endTransformation.y,
            );

            updateForm();
            renderDrawing();
            return;
          }

          if (
            event.key.toUpperCase() == "Q" &&
            editorProperties.selectedRoad &&
            editorProperties.selectedRoad.roadType == "arc"
          ) {
            editorProperties.selectedRoad.endAngle -= event.shiftKey
              ? Math.PI / 180
              : Math.PI / 90;
            updateForm();
            renderDrawing();
            return;
          }

          if (
            event.key.toUpperCase() == "E" &&
            editorProperties.selectedRoad &&
            editorProperties.selectedRoad.roadType == "arc"
          ) {
            editorProperties.selectedRoad.endAngle += event.shiftKey
              ? Math.PI / 180
              : Math.PI / 90;
            updateForm();
            renderDrawing();
            return;
          }

          if (event.key.toUpperCase() == "I" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x +
                (event.shiftKey ? 1 : 5) *
                  Math.cos(editorProperties.selectedRoad.endAngle),
              editorProperties.selectedRoad.endTransformation.y +
                (event.shiftKey ? 1 : 5) *
                  Math.sin(editorProperties.selectedRoad.endAngle),
            );
            updateForm();
            renderDrawing();
            return;
          }

          if (event.key.toUpperCase() == "O" && editorProperties.selectedRoad) {
            editorProperties.selectedRoad.endTransformation = new Point(
              editorProperties.selectedRoad.endTransformation.x -
                (event.shiftKey ? 1 : 5) *
                  Math.cos(editorProperties.selectedRoad.endAngle),
              editorProperties.selectedRoad.endTransformation.y -
                (event.shiftKey ? 1 : 5) *
                  Math.sin(editorProperties.selectedRoad.endAngle),
            );
            updateForm();
            renderDrawing();
            return;
          }
        },
      );

      editorConnections.savePreset = trackEditorConnection(
        document.querySelector("#diagramSavePreset"),
        "click",
        async () => {
          const saveData = saveDiagram();
          const presetName = document
            .querySelector("#diagramFileName")
            ?.value.trim();

          if (!presetName) {
            return;
          }

          saveData.diagramName = presetName;
          await window.diagramLibrary.addDiagram(saveData, presetName);
        },
      );

      editorConnections.renamePreset = trackEditorConnection(
        document.querySelector("#diagramPresetRename"),
        "click",
        async () => {
          if (!currentlySelectedDiagram || currentlySelectedDiagram.isPreset) {
            return;
          }

          let presetName = prompt("Enter a new name for the preset:");
          if (!presetName) {
            return;
          }

          if (
            await window.diagramLibrary.renameDiagram(
              currentlySelectedDiagram.diagramName,
              presetName,
            )
          ) {
            currentlySelectedDiagram.diagramName = presetName;
            loadArrowPresets();
          }
        },
      );

      editorConnections.deletePreset = trackEditorConnection(
        document.querySelector("#diagramPresetDelete"),
        "click",
        async () => {
          if (!currentlySelectedDiagram || currentlySelectedDiagram.isPreset) {
            return;
          }

          await window.diagramLibrary.deleteDiagram(
            currentlySelectedDiagram.diagramName,
          );
          currentlySelectedDiagram = null;
          loadArrowPresets();
        },
      );

      editorConnections.usePreset = trackEditorConnection(
        document.querySelector("#diagramPresetUse"),
        "click",
        () => {
          if (!currentlySelectedDiagram) {
            return;
          }

          loadDiagram(currentlySelectedDiagram);
          document.querySelector("#diagramPresets").close();
          isModalOpen = false;
        },
      );

      editorConnections.closeEditor = trackEditorConnection(
        document.querySelector("#diagrammicDrawingClose"),
        "click",
        () => {
          closeDraw();
        },
      );

      editorConnections.closeEditor2 = trackEditorConnection(
        DiagrammicDrawingHolder,
        "cancel",
        () => {
          const diagram = saveDiagram() || null;
          closeDraw(diagram);

          if (typeof returnMethod === "function") {
            returnMethod(diagram);
          }
        },
      );

      editorConnections.usePresetInSign = trackEditorConnection(
        document.querySelector("#diagramUse"),
        "click",
        () => {
          const diagram = saveDiagram();
          closeDraw(diagram);

          if (typeof returnMethod === "function") {
            returnMethod(diagram);
          }
        },
      );

      editorConnections.importDiagram = trackEditorConnection(
        document.querySelector("#importDiagram"),
        "click",
        async () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";
          input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
              const text = await file.text();
              const data = JSON.parse(text);

              const fileName = file.name;
              loadDiagram(data);
              document.querySelector("#diagramFileName").value =
                fileName.replace(/\.json$/, "");
            }
          };
          input.click();
          input.remove();
        },
      );

      editorConnections.exportDiagramJSON = trackEditorConnection(
        document.querySelector("#exportDiagramJSON"),
        "click",
        () => {
          const diagram = saveDiagram();
          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(diagram));
          const downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute(
            "download",
            (document.querySelector("#diagramFileName").value == ""
              ? "diagram"
              : document.querySelector("#diagramFileName").value) + ".json",
          );
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        },
      );

      editorConnections.exportDiagramImage = trackEditorConnection(
        document.querySelector("#exportDiagramImage"),
        "click",
        async () => {
          const diagram = saveDiagram();
          loadDiagram(diagram, true);
          canvasElement.toBlob((blob) => {
            loadDiagram(diagram, false);
            const output = URL.createObjectURL(blob);
            const downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", output);
            downloadAnchorNode.setAttribute(
              "download",
              (document.querySelector("#diagramFileName").value == ""
                ? "diagram"
                : document.querySelector("#diagramFileName").value) + ".png",
            );
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          });
        },
      );

      if (promptPresets) {
        document.querySelector("#diagramLoadPresets").click();
      }

      updateForm();
      renderDrawing();
    });
  };

  const saveDiagram = () => {
    let saveData = {
      canvasProperties: {},
      roadData: null,
    };

    for (const key in canvasProperties) {
      saveData.canvasProperties[key] = canvasProperties[key];
    }

    let queue = [{ node: rootRoadNode, parentNode: null, pointer: null }];
    while (queue.length > 0) {
      let nextNode = queue.pop();

      let newData = Object.fromEntries(
        Object.entries(nextNode.node)

          .filter(
            ([key, value]) =>
              typeof value !== "function" &&
              ![
                "children",
                "previousRoad",
                "roadIsRendered",
                "calculatedPoints",
                "calculatedPath2D",
                "endPoint",
              ].includes(key),
          )

          .map(([key, value]) => [
            key,
            value instanceof Point ? [value.x, value.y] : value,
          ]),
      );
      newData.children = [];

      if (nextNode.pointer == null) {
        saveData.roadData = newData;
        saveData.roadData.children = [];
      } else {
        nextNode.pointer.children.push(newData);
      }

      if (nextNode.node.children.length > 0) {
        for (const child of nextNode.node.children) {
          queue.push({
            node: child,
            parentNode: nextNode.node,
            pointer: newData,
          });
        }
      }
    }

    return saveData;
  };

  const loadDiagram = (data, isPreview) => {
    if (!data || !data.canvasProperties || !data.roadData) {
      throw new Error("Invalid diagram data.");
    }

    for (const key in data.canvasProperties) {
      if (canvasProperties.hasOwnProperty(key)) {
        canvasProperties[key] = data.canvasProperties[key];
      }
    }

    let queue = [{ node: data.roadData, pointer: null }];
    while (queue.length > 0) {
      let nextNode = queue.pop();

      for (const [key, val] of Object.entries(nextNode.node)) {
        if (
          Array.isArray(val) &&
          val.length == 2 &&
          typeof val[0] === "number" &&
          typeof val[1] === "number"
        ) {
          nextNode.node[key] = new Point(val[0], val[1]);
        }
      }

      let newRoad = new Road({ ...nextNode.node });

      if (nextNode.pointer == null) {
        rootRoadNode = newRoad;
      } else {
        nextNode.pointer.children.push(newRoad);
      }

      if (nextNode.node.children.length > 0) {
        for (const child of nextNode.node.children) {
          queue.push({
            node: child,
            pointer: newRoad,
          });
        }
      }
    }

    editorProperties.selectedRoad = null;
    document.querySelector("#diagramFileName").value = data.diagramName || "";
    updateForm();
    renderDrawing(isPreview);
  };

  const diagramDataToImage = (data, replace = false, inEditor = true) => {
    const diagramName = data && data.diagramName;
    const dataSignature = diagramName ? JSON.stringify(data) : null;
    const cachedImage = diagramName && diagramImageCache[diagramName];

    if (!inEditor && isEditorOpen) {
      return;
    }

    if (
      diagramName &&
      cachedImage &&
      cachedImage.dataSignature === dataSignature &&
      !replace
    ) {
      return cachedImage.output
        ? Promise.resolve(cachedImage.output)
        : cachedImage.imagePromise;
    }

    let saveDataBackup;
    if (inEditor) {
      saveDataBackup = saveDiagram();
    }
    const diagramData = structuredClone(data);

    const imagePromise = new Promise((resolve) => {
      loadDiagram(diagramData, true);
      canvasElement.toBlob((blob) => {
        if (saveDataBackup) {
          loadDiagram(saveDataBackup, false);
        } else {
          resetEditorState();
        }

        const output = URL.createObjectURL(blob);

        if (diagramName) {
          if (cachedImage && cachedImage.output) {
            URL.revokeObjectURL(cachedImage.output);
          }
          diagramImageCache[diagramName] = { dataSignature, output };
        }

        resolve(output);
      });
    });

    if (diagramName) {
      diagramImageCache[diagramName] = { dataSignature, imagePromise };
    }

    return imagePromise;
  };

  const init = (appModule) => {
    app = appModule;
    initializeDiagramModals();

    for (const direction of ["Auto", "Left", "Right", "Top", "Bottom"]) {
      lib.appendOption(
        document.querySelector("#objectSubpanelDirection"),
        direction.toLowerCase(),
        { text: direction },
      );
    }
  };

  return {
    promptDraw,
    vars: {
      get canvasProperties() {
        return canvasProperties;
      },
      get editorProperties() {
        return editorProperties;
      },
      get editorConnections() {
        return editorConnections;
      },
      get rootRoadNode() {
        return rootRoadNode;
      },
    },
    readForm,
    updateForm,
    saveDiagram,
    loadDiagram,
    diagramDataToImage,
    init,
  };
})();

window.Point = Point;
window.Road = Road;
