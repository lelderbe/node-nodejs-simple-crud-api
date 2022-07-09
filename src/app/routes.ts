import { IncomingMessage, ServerResponse } from 'http';
import { NotFoundError, ValidationError } from './errors';
import { UsersController } from '../users/users.controller';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import {
	ERR_RESOURCE_NOT_FOUND,
	ERR_UNEXPECTED_ERROR,
	ERR_UNSUPPORTED_OPERATION,
} from './constants';

export const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

export const routes = async function (req: IncomingMessage, res: ServerResponse) {
	console.log(`Worker ${process.pid} requested`);
	res.setHeader('Content-Type', 'application/json');
	const [api, users, id, ...rest] = req.url.split('/').filter(Boolean);
	console.log('api:', api, 'users:', users, 'id:', id, 'rest:', rest);

	const buffers = [] as any;
	for await (const chunk of req) {
		buffers.push(chunk);
	}
	const body = Buffer.concat(buffers).toString();

	if (`${api}/${users}` === 'api/users' && !rest.length) {
		let result;
		let statusCode = 200;

		try {
			switch (req.method) {
				case 'GET':
					result = await (id
						? usersController.findOne(id)
						: usersController.findAll());
					break;
				case 'POST':
					if (id) {
						throw new NotFoundError(ERR_RESOURCE_NOT_FOUND);
					}
					result = await usersController.create(body);
					statusCode = 201;
					break;
				case 'PUT':
					result = await usersController.update(id, body);
					break;
				case 'DELETE':
					result = await usersController.remove(id);
					statusCode = 204;
					break;
				default:
					throw new Error(ERR_UNSUPPORTED_OPERATION);
			}
		} catch (err: any) {
			if (err instanceof ValidationError) {
				statusCode = 400;
			} else if (err instanceof NotFoundError) {
				statusCode = 404;
			} else if (err instanceof Error) {
				statusCode = 500;
				err.message = ERR_UNEXPECTED_ERROR;
			}
			result = { code: statusCode, message: err.message };
		}

		res.writeHead(statusCode);
		res.end(JSON.stringify(result));
	} else {
		res.writeHead(404);
		res.end(JSON.stringify({ code: 404, message: ERR_RESOURCE_NOT_FOUND }));
	}
};
