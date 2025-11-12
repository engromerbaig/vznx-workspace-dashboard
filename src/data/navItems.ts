import { IconType } from 'react-icons';
import { FaHome } from 'react-icons/fa';
import { IoPeople } from 'react-icons/io5';
import { MdAssignment } from 'react-icons/md';
import { MdOutlineSpaceDashboard } from "react-icons/md";

export interface NavItem {
  name: string;
  path: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: MdOutlineSpaceDashboard },
  { name: 'Projects', path: '/projects', icon: MdAssignment },
  { name: 'Team', path: '/team', icon: IoPeople },
];
