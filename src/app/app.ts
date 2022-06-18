import 'dotenv/config';
import http from 'http';
import { routes } from './routes';

const PORT = process.env.PORT || 4000;

export const app = http.createServer(routes);

export const bootstrap = () => app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
