import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import os from 'os';
import { parseArgs } from '../utils/args';
import { routes, usersRepository } from './routes';

const PORT = process.env.PORT || 4000;
const args = parseArgs();

export const app = http.createServer(routes);

export const bootstrap = () => {
	if (args['cluster']) {
		if (cluster.isPrimary) {
			const numCPUs = os.cpus().length;

			console.log(`Primary ${process.pid} is running, wait for workers...`);

			for (let i = 0; i < numCPUs; i++) {
				cluster.fork();
			}

			cluster.on('exit', (worker, code, signal) => {
				console.log(`worker ${worker.process.pid} died`);
			});

			cluster.on('message', async (worker, message) => {
				if (message.cmd in usersRepository) {
					const data = await usersRepository[message.cmd](...message.data);
					worker.send({ cmd: message.cmd, data });
				}
			});
		} else {
			// Workers can share any TCP connection
			// In this case it is an HTTP server
			app.listen(PORT, () => {
				console.log(
					`Worker ${process.pid} server running at http://localhost:${PORT}/`,
				);
			});

			process.on('message', (message) => {
				usersRepository.emit(message['cmd'], message);
			});
		}
	} else {
		app.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}/`);
		});
	}
};
