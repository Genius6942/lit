import { useState } from "react";

const splitImageInto16 = (image: HTMLImageElement) => {
	const canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	ctx.drawImage(image, 0, 0);
	const imageData = ctx.getImageData(0, 0, image.width, image.height);
	const data = imageData.data;
	const width = image.width / 4;
	const height = image.height / 4;
	const squares = [];
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			const square = [];
			for (let k = 0; k < height; k++) {
				for (let l = 0; l < width; l++) {
					const index = (i * height + k) * image.width * 4 + (j * width + l) * 4;
					square.push(data[index]);
				}
			}
			squares.push(square);
		}
	}

	return squares;
}

export default function Captcha() {
	const [squares, setSquares] = useState(Array(16).fill(false));
	return (
		<div className="fixed top-0 right-0 left-0 bottom-0 grid place-items-center z-10 backdrop-blur-md">
			<div className="p-3 bg-gray-300">
				<div>
					Select all that contain
					<div className="text-6xl">BUGS</div>
					If there are none, click skip
				</div>
				<div className="grid grid-cols-4 gap-3">
					{squares.map((square, index) => (
						<div
							key={index}
							className={`w-32 h-32 bg-gray-300 rounded-md ${
								square ? "bg-green-300" : ""
							}`}
							onClick={() => {
								const newSquares = [...squares];
								newSquares[index] = !newSquares[index];
								setSquares(newSquares);
							}}
						/>
					))}
					</div>
			</div>
		</div>
	)
}