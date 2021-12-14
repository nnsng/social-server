const userList = [];

export function joinRoom(id, userId, room) {
	const user = { id, userId, room };
	userList.push(user);
	return user;
}

export function getUser(id) {
	return userList.find((user) => user.id === id);
}

export function outRoom(id) {
	const index = userList.findIndex((user) => user.id === id);

	if (index < 0) return;

	return userList.splice(index, 1)[0];
}
