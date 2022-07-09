import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user';
import { UsersService } from './users.service';

export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	async create(input: string): Promise<User> {
		const createUserDto = CreateUserDto.getCreateUserDto(input);
		return this.usersService.create(createUserDto);
	}

	async findAll(): Promise<User[]> {
		return this.usersService.findAll();
	}

	async findOne(id: string): Promise<User> {
		this.usersService.validateUserId(id);
		return this.usersService.findOne(id);
	}

	async update(id: string, input: string): Promise<User> {
		this.usersService.validateUserId(id);
		const updateUserDto = UpdateUserDto.getUpdateUserDto(input);
		return this.usersService.update(id, updateUserDto);
	}

	async remove(id: string): Promise<User> {
		this.usersService.validateUserId(id);
		return this.usersService.remove(id);
	}
}
