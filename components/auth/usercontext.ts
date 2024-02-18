'use client';

import React from 'react';
import { UserInfo } from '@/app/api/user/info/route';

const UserContext = React.createContext<UserInfo | null>(null);
export default UserContext;