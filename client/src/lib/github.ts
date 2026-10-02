import { useEffect, useState } from 'react';
import snapshot from '../data/github-snapshot.json';

export const GITHUB_USER = 'shahzaibeng';
// Years shown in the contribution graph, newest first.
export const YEARS = [2026, 2025];

export interface Day {
  date: string;
  count: number;
  level: number; // 0–4, as on GitHub
}

export interface GitHubActivity {
  days: Day[];
  totals: Record<string, number>;
  publicRepos: number;
  /** 'live' once the APIs answer; 'snapshot' while loading or offline. */
  source: 'live' | 'snapshot';
}

const fromSnapshot = (): GitHubActivity => ({
  days: snapshot.contributions.map(([date, count, level]) => ({
    date: date as string,
    count: count as number,
    level: level as number,
  })),
  totals: snapshot.total,
  publicRepos: snapshot.publicRepos,
  source: 'snapshot',
});

const today = () => new Date().toISOString().slice(0, 10);

/** Consecutive days with contributions, ending today (or yesterday if today is still empty). */
export function streaks(days: Day[]) {
  const past = days.filter((day) => day.date <= today());
  let longest = 0;
  let run = 0;
  for (const day of past) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = past.length - 1;
  if (i >= 0 && past[i].count === 0) i--;
  for (; i >= 0 && past[i].count > 0; i--) current++;
  return { current, longest };
}

/**
 * Contribution calendar and repository count for the profile. Shows the bundled snapshot
 * immediately, then replaces it with live data from public, CORS-enabled APIs.
 */
export function useGitHubActivity(years: number[]) {
  const [activity, setActivity] = useState<GitHubActivity>(fromSnapshot);
  const key = years.join(',');

  useEffect(() => {
    const controller = new AbortController();
    const query = key
      .split(',')
      .map((year) => `y=${year}`)
      .join('&');
    Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?${query}`, {
        signal: controller.signal,
      }).then((response) => (response.ok ? response.json() : Promise.reject(response.status))),
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    ])
      .then(([calendar, profile]) => {
        setActivity({
          days: calendar.contributions,
          totals: calendar.total,
          publicRepos: profile?.public_repos ?? snapshot.publicRepos,
          source: 'live',
        });
      })
      .catch(() => {
        // Keep the snapshot; the graph still renders offline or if the API is down.
      });
    return () => controller.abort();
  }, [key]);

  return activity;
}
