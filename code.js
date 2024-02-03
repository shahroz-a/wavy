figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
	if (msg.type === "createLine") {
		const { lineType, pixelWidth, lineLength, rotationAngle } = msg;

		// Implement logic to create lines based on the selected type and custom properties
		const line = createLine(
			lineType,
			Number(pixelWidth),
			Number(lineLength),
			Number(rotationAngle)
		);

		// Add the created line to the Figma document
		if (line) {
			figma.currentPage.appendChild(line);
		}

		// Close the plugin UI
		figma.closePlugin();
	}
};

function degrees_to_radians(degrees) {
	var pi = Math.PI;
	return degrees * (pi / 180);
}

function createLine(type, pixelWidth, lineLength, rotationAngle) {
	if (type === "wavy") {
		// want to make a zig zag pattern with 10 points on lenth of line
		let zigZagLines = [];
		// angle is rotationAngle
		let lengthRemaining = lineLength;
		let index = 0;
		let startX = 0;
		while (lengthRemaining > 0) {
			// create a line from startX

			const zigZagLine = figma.createLine();
			zigZagLine.x = startX;
			zigZagLine.y = 0;
			zigZagLine.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
			zigZagLine.strokeWeight = parseFloat(pixelWidth);
			const length = 1000;
			zigZagLine.resize(length, 0);
			let angle = rotationAngle;
			// if even iteration angle should be rotationAngle else -rotationAngle
			if (index % 2 === 0) {
				angle = rotationAngle;
			} else {
				angle = 180 - rotationAngle;
			}
			zigZagLine.rotation = parseFloat(angle);
			zigZagLines.push(zigZagLine);
			//  to calculate the length to be reduced from the line
			const lengthReduced =
				length * Math.cos(degrees_to_radians(rotationAngle));
			// shift the line by lengthReduced
			if (index % 2 === 0) {
				startX += 2 * lengthReduced;
			}

			lengthRemaining -= lengthReduced;
			index++;
		}

		return null;
	}

	const line = figma.createLine();
	line.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
	line.strokeWeight = parseFloat(pixelWidth);
	line.resize(lineLength, 0);

	if (type === "straight") {
		// Do nothing extra for straight lines
	} else if (type === "curved") {
		line.strokeJoin = "ROUND";
	} else if (type === "wavy") {
		// const zigZagGroup = figma.group(zigZagLines, figma.currentPage);
		// zigZagGroup.x = 0;
		// zigZagGroup.y = 0;
		// line.appendChild(zigZagGroup);
	}

	// line.rotation = parseFloat(rotationAngle);

	return null;
}
