import { observer } from 'mobx-react-lite';
import React from 'react';

import ListGenerator from '@/app/generators/ListGenerator';
import { User } from '../users/User';
interface UserListProps{
  users?: User[];
}

const UserList: React.FC<UserListProps> = observer(({ users = [] }) => {
  // Explicitly type users as an array of User

  return (
    <div>
      <h2>User List</h2>
      <ListGenerator items={users} />
    </div>
  );
});

export default UserList;
