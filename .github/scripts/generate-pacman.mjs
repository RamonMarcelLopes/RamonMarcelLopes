import fs from 'node:fs';
import path from 'node:path';
import { ArcadeRenderer } from 'pacman-contribution-graph';

const username = process.env.GITHUB_USER;
const token = process.env.GITHUB_TOKEN;
const outDir = process.env.OUT_DIR || 'dist';

if (!username || !token) {
	console.error('GITHUB_USER and GITHUB_TOKEN are required');
	process.exit(1);
}

const generate = (gameTheme) =>
	new Promise((resolve, reject) => {
		let svg = '';
		const renderer = new ArcadeRenderer({
			game: 'pacman',
			platform: 'github',
			username,
			gameTheme,
			showMonthLabels: true,
			githubSettings: { accessToken: token },
			svgCallback: (result) => {
				svg = result;
			},
			gameOverCallback: () => resolve(svg),
			pointsIncreasedCallback: () => {}
		});
		renderer.start().catch(reject);
	});

fs.mkdirSync(outDir, { recursive: true });

for (const [theme, file] of [
	['github', 'pacman-contribution-graph.svg'],
	['github-dark', 'pacman-contribution-graph-dark.svg']
]) {
	const svg = await generate(theme);
	if (!svg) throw new Error(`Empty SVG for theme ${theme}`);
	fs.writeFileSync(path.join(outDir, file), svg);
	console.log(`Wrote ${path.join(outDir, file)}`);
}
