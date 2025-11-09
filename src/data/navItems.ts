import { IconType } from 'react-icons';
import { FaHome } from 'react-icons/fa';
import { IoPeople } from 'react-icons/io5';
import { MdInventory, MdReceipt } from 'react-icons/md';
import { AiOutlineTransaction } from 'react-icons/ai';

export interface NavItem {
  name: string;
  path: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: FaHome },
  { name: 'Clients', path: '#', icon: IoPeople },
  { name: 'Inventory', path: '#', icon: MdInventory },
  { name: 'Transactions', path: '#', icon: AiOutlineTransaction },
  { name: 'Invoice', path: '#', icon: MdReceipt },
];