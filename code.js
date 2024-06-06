figma.showUI(__html__);
figma.ui.resize(300, 656);

figma.ui.onmessage = (msg) => {
    console.log('Received message:', msg); // Debugging
    if (msg.type === "createLine") {
        const { lineType, strokeWidth, cornerRadius, edgeFreq, lineLength, rotationAngle } = msg;

        // Implement logic to create lines based on the selected type and custom properties
        const line = createLine(
            lineType,
            Number(strokeWidth),
            Number(cornerRadius),
            Number(edgeFreq),
            Number(lineLength),
            Number(rotationAngle)
        );

        // Add the created line to the Figma document
        if (line) {
            figma.currentPage.appendChild(line);
        }

        // Close the plugin UI
        figma.closePlugin();
    } else if (msg.type === "resize") {
        console.log('Resizing UI to height:', msg.height); // Debugging
        figma.ui.resize(300, msg.height);
    }
};

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function createLine(type, strokeWidth, cornerRadius, edgeFreq, lineLength, rotationAngle) {
    
    if (type === 'jagged' || type === 'curved' || type === 'ramp') {
        async function main() {
            // store center of viewport
            const center = figma.viewport.center;

            // calculate helpers
            const horWidth = (lineLength / (edgeFreq))*2;
            const verHeight = horWidth * Math.tan(Math.PI / 180 * rotationAngle); // convert degrees to radians

            const numberOfSegments = edgeFreq ;

            let points = [];
            let xOld = 0;
            let xNew = 0;
            for (let i = 0; i <= numberOfSegments; i++) {
                if (type === 'ramp') {
                    points.push({ x: xOld, y: i % 2 == 0 ? 0 : verHeight });
                } else {
                    points.push({ x: xOld, y: i % 2 == 0 ? 0 : verHeight });
                }
                xNew = xOld + (type == 'ramp' && i % 2 != 0  ? 0 : horWidth);
                xOld = xNew;
            }

            let segments = [];
            for (let i = 0; i < numberOfSegments; i++) {
                const currentSegment = { "start": i, "end": i + 1, "tangentStart": { "x": 0, "y": 0 }, "tangentEnd": { "x": 0, "y": 0 } };
                segments.push(currentSegment);
            }

            let vertices = [];
            for (let i = 0; i <= numberOfSegments; i++) {
                const currentVertex = {
                    "x": points[i].x,
                    "y": -points[i].y,
                    "strokeCap": "NONE",
                    "strokeJoin": "MITER",
                    "cornerRadius": cornerRadius,
                    "handleMirroring": "NONE"
                };
                vertices.push(currentVertex);
            }

            let vectorData = "";
            for (let i = 0; i < edgeFreq; i++) {
                if (i === 0) {
                    vectorData = vectorData.concat(`M ${points[i].x.toString()} ${points[i].y.toString()} `);
                } else {
                    vectorData = vectorData.concat(`L ${points[i].x.toString()} ${points[i].y.toString()} `);
                }
            }

            // Create VECTOR
            var currentVector = figma.createVector();
            figma.currentPage.appendChild(currentVector);
            currentVector.name = type === 'jagged' ? "jagged line" : type === 'curved' ? "curved line" : "ramp line"; // Name based on line type
            currentVector.strokes = [
                {
                    "type": "SOLID",
                    "visible": true,
                    "opacity": 1,
                    "blendMode": "NORMAL",
                    "color": { "r": 0.258, "g": 0.812, "b": 0.443 },  // Hex #42CF71 converted to RGB
                    "boundVariables": {}
                }
            ];
            currentVector.strokeWeight = strokeWidth;
            currentVector.relativeTransform = [[1, 0, center.x], [0, 1, center.y]];
            currentVector.x = center.x;
            currentVector.y = center.y;
            currentVector.constrainProportions = true;
            currentVector.vectorNetwork = {
                "regions": [],
                "segments": segments,
                "vertices": vertices,
            };
            currentVector.vectorPaths = [
                {
                    "windingRule": "NONE",
                    "data": vectorData,
                }
            ];

            figma.viewport.scrollAndZoomIntoView([currentVector]);
        }

        main().then(() => {
            figma.closePlugin();
        });
    } else if (type === 'straight') {
        const line = figma.createLine();
        line.strokes = [{ type: "SOLID", color: { r: 0.258, g: 0.812, b: 0.443 } }];  // Hex #42CF71 converted to RGB
        line.strokeWeight = parseFloat(strokeWidth);
        line.resize(lineLength, 0);
    }
    else{
        figma.notify("Please select a line type");
    }

    return null;
}
