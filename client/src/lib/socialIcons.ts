// Brand icons for each account in config/site.ts, shared by the footer and the left dock.
import type { IconType } from 'react-icons';
import {
  SiGithub,
  SiLeetcode,
  SiKaggle,
  SiHuggingface,
  SiOrcid,
  SiPypi,
  SiHashnode,
  SiInstagram,
  SiGmail,
  SiX,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa';
import type { AccountId } from '../config/site';

export const icons: Record<AccountId, IconType> = {
  github: SiGithub,
  linkedin: FaLinkedinIn,
  x: SiX,
  leetcode: SiLeetcode,
  kaggle: SiKaggle,
  huggingface: SiHuggingface,
  orcid: SiOrcid,
  pypi: SiPypi,
  hashnode: SiHashnode,
  instagram: SiInstagram,
  email: SiGmail,
};
