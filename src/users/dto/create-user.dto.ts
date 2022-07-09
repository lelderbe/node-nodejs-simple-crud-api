import { ERR_BODY_INVALID_FORMAT, ERR_BODY_VALIDATION } from '../../app/constants';
import { ValidationError } from '../../app/errors';

export class CreateUserDto {
	username: string;
	age: number;
	hobbies: string[];

	static getCreateUserDto(input: string): CreateUserDto {
		let createUserDto: CreateUserDto;
		try {
			createUserDto = JSON.parse(input);
		} catch (err) {
			throw new ValidationError(ERR_BODY_INVALID_FORMAT);
		}

		if (typeof createUserDto.username !== 'string' ||
			typeof createUserDto.age !== 'number' ||
			!Array.isArray(createUserDto.hobbies) ||
			createUserDto.hobbies.some((item) => typeof item !== 'string')) {
			throw new ValidationError(ERR_BODY_VALIDATION);
		}

		createUserDto.username = createUserDto.username.trim();
		createUserDto.hobbies.map((item) => item.trim());

		if (!createUserDto.username) {
			throw new ValidationError(ERR_BODY_VALIDATION);
		}

		return createUserDto;
	}
}
