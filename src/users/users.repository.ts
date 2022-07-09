import * as uuid from 'uuid';
import cluster from 'cluster';
import { EventEmitter } from 'events';
import { User } from './entity/user';
import { ERR_UNEXPECTED_ERROR } from '../app/constants';

export class UsersRepository extends EventEmitter {
	private readonly users: User[] = [];

	private async requestMasterForData(obj): Promise<any> {
		return new Promise((resolve, reject) => {
			const result = process.send(obj, () => {
				this.once(obj.cmd, (msg) => {
					resolve(msg['data']);
				});
			});
			if (!result) {
				throw new Error(ERR_UNEXPECTED_ERROR);
			}
		});
	}

	async find(): Promise<User[]> {
		if (cluster.isWorker) {
			const obj = { cmd: 'find', data: [] };
			return this.requestMasterForData(obj);
		} else {
			return new Promise((resolve, reject) => {
				resolve(this.users);
			});
		}
	}

	async findOne(id: string): Promise<User> {
		if (cluster.isWorker) {
			const obj = { cmd: 'findOne', data: [id] };
			return this.requestMasterForData(obj);
		} else {
			return new Promise((resolve, reject) => {
				resolve(this.users.filter((item) => item.id === id)[0]);
			});
		}
	}

	async create(input: Partial<User>): Promise<User> {
		if (cluster.isWorker) {
			const obj = { cmd: 'create', data: [input] };
			return this.requestMasterForData(obj);
		} else {
			return new Promise((resolve, reject) => {
				const user = Object.assign(new User(), { id: uuid.v4(), ...input });
				this.users.push(user);
				resolve(user);
			});
		}
	}

	async update(id: string, input: Partial<User>): Promise<User> {
		if (cluster.isWorker) {
			const obj = { cmd: 'update', data: [id, input] };
			return this.requestMasterForData(obj);
		} else {
			return new Promise(async (resolve, reject) => {
				const user = Object.assign(await this.findOne(id), input);
				resolve(user);
			});
		}
	}

	async remove(id: string): Promise<User> {
		if (cluster.isWorker) {
			const obj = { cmd: 'remove', data: [id] };
			return this.requestMasterForData(obj);
		} else {
			return new Promise((resolve, reject) => {
				const index = this.users.findIndex((item) => item.id === id);
				if (index != -1) {
					const user = this.users.splice(index, 1)[0];
					resolve(user);
				}

				resolve(undefined);
			});
		}
	}
}
