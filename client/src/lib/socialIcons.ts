// Brand icons for each account in config/site.ts, shared by the footer and the left dock.
import type { IconType } from 'react-icons';
import {
  SiGithub,
  SiLeetcode,
  SiKaggle,
  SiHuggingface,
  SiInstagram,
  SiGmail,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import type { AccountId } from '../config/site';

export const icons: Record<AccountId, IconType> = {
  github: SiGithub,
  linkedin: FaLinkedinIn,
  leetcode: SiLeetcode,
  kaggle: SiKaggle,
  huggingface: SiHuggingface,
  instagram: SiInstagram,
  email: SiGmail,
};
