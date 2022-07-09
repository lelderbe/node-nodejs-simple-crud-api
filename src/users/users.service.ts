import * as uuid from 'uuid';
import { ERR_USERID_INVALID, ERR_USER_NOT_FOUND } from '../app/constants';
import { NotFoundError, ValidationError } from '../app/errors';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user';
import { UsersRepository } from './users.repository';

export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async create(input: CreateUserDto): Promise<User> {
		return this.usersRepository.create(input);
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	async findOne(id: string): Promise<User> {
		const user = await this.usersRepository.findOne(id);

		if (!user) {
			throw new NotFoundError(ERR_USER_NOT_FOUND);
		}

		return user;
	}

	async update(id: string, input: UpdateUserDto): Promise<User> {
		await this.findOne(id);
		const result = this.usersRepository.update(id, input);
		return result;
	}

	async remove(id: string): Promise<User> {
		await this.findOne(id);
		return this.usersRepository.remove(id);
	}

	validateUserId(id: string) {
		if (!uuid.validate(id)) {
			throw new ValidationError(ERR_USERID_INVALID);
		}
	}
}
