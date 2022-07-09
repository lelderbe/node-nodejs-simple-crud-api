import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends CreateUserDto { 
	static getUpdateUserDto(input: string): UpdateUserDto {
		return Object.assign(new UpdateUserDto(), this.getCreateUserDto(input));
	}

}