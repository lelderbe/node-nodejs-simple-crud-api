import supertest from 'supertest';
import { app } from '../src/app/app';
import { ERR_BODY_VALIDATION, ERR_RESOURCE_NOT_FOUND, ERR_USERID_INVALID, ERR_USER_NOT_FOUND } from '../src/app/constants';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { User } from '../src/users/entity/user';

const API = '/api/users';

describe('Scenario 1 - all operations', () => {
	const fakeUser = Object.assign(new User(), {
		username: 'Joe',
		age: 15,
		hobbies: ['ski', 'music'],
	});

	it('should return no users', async () => {
		const expected = [];

		const response = await supertest(app).get(API);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should create user', async () => {
		const expected = fakeUser;
		const createUserDto = Object.assign(new CreateUserDto(), fakeUser);

		const response = await supertest(app).post(API)
			.send(JSON.stringify(createUserDto));

		expect(response.statusCode).toBe(201);
		expect(response.body.id).not.toBe('');
		fakeUser.id = response.body.id;
		expect(response.body).toEqual(expected);
	});

	it('should get user', async () => {
		const expected = fakeUser;
		const id = fakeUser.id;

		const response = await supertest(app).get(`${API}/${id}`);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should update user', async () => {
		const expected = fakeUser;
		fakeUser.username = 'Mary';
		fakeUser.hobbies = ['sport'];
		const updateUserDto = Object.assign(new UpdateUserDto(), {
			username: 'Mary',
			age: 15,
			hobbies: ['sport'],
		});

		const response = await supertest(app).put(`${API}/${fakeUser.id}`)
			.send(JSON.stringify(updateUserDto));

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should delete user', async () => {
		const id = fakeUser.id;

		const response = await supertest(app).delete(`${API}/${id}`);

		expect(response.statusCode).toBe(204);
	});

	it('should find no user', async () => {
		const id = fakeUser.id;
		const expected = { code: 404, message: ERR_USER_NOT_FOUND }

		const response = await supertest(app).get(`${API}/${id}`);

		expect(response.statusCode).toBe(404);
		expect(response.body.message).not.toBeUndefined;
		expect(response.body).toEqual(expected);
	});

});

describe('Scenario 2 - operations when no user for given id', () => {
	const fakeUser = Object.assign(new User(), {
		id: 'e3e70309-5ed6-4a79-bc1c-2166d964ca7c',
		username: 'Joe',
		age: 15,
		hobbies: ['ski', 'music'],
	});

	it('should return no users', async () => {
		const expected = [];

		const response = await supertest(app).get(API);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should return 404 on find non-exist user', async () => {
		const id = fakeUser.id;
		const expected = { code: 404, message: ERR_USER_NOT_FOUND }

		const response = await supertest(app).get(`${API}/${id}`);

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual(expected);
	});

	it('should return 404 on update non-exist user', async () => {
		const updateUserDto = Object.assign(new UpdateUserDto(), fakeUser);
		const expected = { code: 404, message: ERR_USER_NOT_FOUND }

		const response = await supertest(app).put(`${API}/${fakeUser.id}`)
			.send(JSON.stringify(updateUserDto));

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual(expected);
	});

	it('should return 404 on delete non-exist user', async () => {
		const id = fakeUser.id;
		const expected = { code: 404, message: ERR_USER_NOT_FOUND }

		const response = await supertest(app).delete(`${API}/${id}`);

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual(expected);
	});

	it('should return 404 on get non-exist endpoint', async () => {
		const id = fakeUser.id;
		const expected = { code: 404, message: ERR_RESOURCE_NOT_FOUND }

		const response = await supertest(app).get(`${API}/${id}/wrong`);

		expect(response.statusCode).toBe(404);
		expect(response.body).toEqual(expected);
	});
});

describe('Scenario 3 - validate user input', () => {
	const fakeUser = Object.assign(new User(), {
		id: 'e3e70309-5ed6-4a79-bc1c-2166d964ca7c',
		username: 'Joe',
		age: 15,
		hobbies: ['ski', 'music'],
	});

	it('should return no users', async () => {
		const expected = [];

		const response = await supertest(app).get(API);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on wrong id format for find user', async () => {
		const id = 'wrong_id_format';
		const expected = { code: 400, message: ERR_USERID_INVALID }

		const response = await supertest(app).get(`${API}/${id}`);

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on wrong id format for update user', async () => {
		const id = 'wrong_id_format';
		const expected = { code: 400, message: ERR_USERID_INVALID }

		const response = await supertest(app).put(`${API}/${id}`)
			.send(JSON.stringify({}));

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on wrong id format for delete user', async () => {
		const id = 'wrong_id_format';
		const expected = { code: 400, message: ERR_USERID_INVALID }

		const response = await supertest(app).delete(`${API}/${id}`);

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on incomplete body data for create user', async () => {
		const createUserDto = Object.assign(new CreateUserDto(), {
			username: 'Mary',
			hobbies: ['sport'],
		});
		const expected = { code: 400, message: ERR_BODY_VALIDATION }

		const response = await supertest(app).post(API)
			.send(JSON.stringify(createUserDto));

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on incomplete body data for update user', async () => {
		const id = fakeUser.id;
		const updateUserDto = Object.assign(new UpdateUserDto(), {
			username: 'Mary',
			hobbies: ['sport'],
		});
		const expected = { code: 400, message: ERR_BODY_VALIDATION }

		const response = await supertest(app).put(`${API}/${id}`)
			.send(JSON.stringify(updateUserDto));

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on invalid body data for create user', async () => {
		const createUserDto = 'invalid_data';
		const expected = { code: 400, message: ERR_BODY_VALIDATION }

		const response = await supertest(app).post(API)
			.send(JSON.stringify(createUserDto));

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});

	it('should return 400 on invalid body data for update user', async () => {
		const id = fakeUser.id;
		const updateUserDto = 'invalid_data';
		const expected = { code: 400, message: ERR_BODY_VALIDATION }

		const response = await supertest(app).put(`${API}/${id}`)
			.send(JSON.stringify(updateUserDto));

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual(expected);
	});
});
