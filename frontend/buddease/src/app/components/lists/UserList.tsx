import { observer } from 'mobx-react-lite';
import React from 'react';

import { User, UserDetails } from '../users/User';
interface UserListProps{
  users?: User[];
}

const UserList: React.FC<UserListProps> = observer(({ users = [] }) => {
  // Explicitly type users as an array of User

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>
            {user.id} - {user.username}
            <UserDetails user={user} />
          </li>
        ))}
      </ul>
    </div>
  );
});

export default UserList;
