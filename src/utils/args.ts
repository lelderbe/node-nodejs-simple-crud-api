export const parseArgs = () => {
	const args = process.argv.slice(2);

	const dict = {};

	for (const arg of args) {
		if (arg.startsWith('--')) {
			const [key, value] = arg.split('=');
			dict[key.slice(2)] = value;
		}
	}

	return dict;
};
