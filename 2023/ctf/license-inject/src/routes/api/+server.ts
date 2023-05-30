import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import { createWorker } from 'tesseract.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import sqlite from 'sqlite3';
import randomName from 'random-name';

const __dirname = dirname(fileURLToPath(import.meta.url));

// @ts-ignore
export const POST: RequestHandler = async ({ request }) => {
	const data = await request.formData();
	const filePath = path.join(
		process.env.NODE_ENV === 'development' ? __dirname : '',
		process.env.NODE_ENV === 'development' ? '../../../uploads' : '/tmp/',
		Array(30)
			.fill('')
			.map(
				() =>
					'wertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-'[
						Math.floor(Math.random() * 63)
					]
			)
			.join('') +
			'.' +
			mime.extension((data.get('file') as File).type)
	);
	const file = data.get('file') as File;
	if (!file) {
		return error(400, 'No file');
	}

	await fs.writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
	try {
		const worker = await createWorker({
			// logger: (m) => console.log((m.progress * 100).toString() + '%')
		});

		await worker.loadLanguage('eng');
		await worker.initialize('eng');
		const {
			data: { text }
		} = await worker.recognize(filePath);
		await worker.terminate();

		fs.unlink(filePath);

		try {
			const db = new sqlite.Database(
				path.join(
					process.env.NODE_ENV === 'development' ? __dirname : '',
					process.env.NODE_ENV === 'development' ? '../../../' : '/tmp/',
					'data.db'
				)
			);
			await new Promise((resolve, reject) => {
				// create db
				db.run(
					`CREATE TABLE IF NOT EXISTS plates (name TEXT, number INTEGER, fine TEXT, PRIMARY KEY (name, number))`,
					(err) => {
						if (err) return reject(err);
						// populate db with plates
						const dbSize = 1000 * 1000;
						const plates = Array(dbSize)
							.fill({ name: '', number: 0, fine: '' })
							// @ts-ignore
							.map(() => ({ name: randomName(), number: 0, fine: '' }));
					}
				);
			});
		} catch (e) {
			return error(40, 'Invalid license plate');
		}

		return json({ text });
	} catch (e) {
		fs.unlink(filePath);
		return error(500, 'An error occured while trying to extract text');
	}
};
