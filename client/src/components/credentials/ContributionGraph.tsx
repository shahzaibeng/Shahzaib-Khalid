import { useMemo, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { GITHUB_USER, streaks } from '../../lib/github';
import type { Day, GitHubActivity } from '../../lib/github';

import { YEARS } from '../../lib/github';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateLabel = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Splits a year into GitHub-style week columns (Sunday first), padding the first week. */
function weeksOf(days: Day[]) {
  const weeks: (Day | null)[][] = [];
  let week: (Day | null)[] = [];
  if (days.length) {
    const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    week = Array(firstWeekday).fill(null);
  }
  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  return weeks;
}

/** GitHub contribution calendar in the portfolio's brass palette, with live stats. */
export function ContributionGraph({ activity }: { activity: GitHubActivity }) {
  const [year, setYear] = useState(YEARS[0]);
  const days = useMemo(
    () => activity.days.filter((day) => day.date.startsWith(String(year))),
    [activity.days, year],
  );
  const weeks = useMemo(() => weeksOf(days), [days]);
  const { current, longest } = useMemo(() => streaks(activity.days), [activity.days]);
  const allTime = Object.values(activity.totals).reduce((sum, value) => sum + value, 0);

  // Where each month's label sits: the first week containing that month's 1st.
  const monthColumns = MONTHS.map((_, month) =>
    weeks.findIndex((week) =>
      week.some((day) => day && new Date(`${day.date}T00:00:00Z`).getUTCMonth() === month),
    ),
  );

  return (
    <section className="gh-card" aria-labelledby="gh-heading" data-symbiote-target="card">
      <header className="gh-head">
        <div>
          <p className="gh-eyebrow">
            GitHub activity · {activity.source === 'live' ? 'live' : 'snapshot'}
          </p>
          <h3 id="gh-heading" className="gh-title">
            {(activity.totals[year] ?? 0).toLocaleString()} contributions in {year}
          </h3>
        </div>
        <div className="gh-years" role="group" aria-label="Year">
          {YEARS.map((option) => (
            <button
              key={option}
              type="button"
              className="gh-year"
              aria-pressed={option === year}
              onClick={() => setYear(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <div className="gh-scroll">
        <div
          className="gh-graph"
          style={{ gridTemplateColumns: `2rem repeat(${weeks.length}, 12px)` }}
        >
          <span />
          {weeks.map((_, column) => {
            const month = monthColumns.indexOf(column);
            return (
              <span key={`m${column}`} className="gh-month">
                {month >= 0 ? MONTHS[month] : ''}
              </span>
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
            <div key={weekday} className="gh-row" style={{ display: 'contents' }}>
              <span className="gh-weekday">{['', 'Mon', '', 'Wed', '', 'Fri', ''][weekday]}</span>
              {weeks.map((week, column) => {
                const day = week[weekday];
                return day ? (
                  <i
                    key={`${column}-${weekday}`}
                    className="gh-day"
                    data-level={day.level}
                    title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${dateLabel.format(new Date(`${day.date}T00:00:00Z`))}`}
                  />
                ) : (
                  <i key={`${column}-${weekday}`} className="gh-day gh-day-empty" />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="gh-foot">
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-link"
          data-symbiote-target
        >
          github.com/{GITHUB_USER} <FiArrowUpRight aria-hidden="true" />
        </a>
        <span className="gh-legend" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((level) => (
            <i key={level} className="gh-day" data-level={level} />
          ))}
          More
        </span>
      </footer>

      <dl className="gh-stats">
        <div>
          <dt>Total contributions</dt>
          <dd>{allTime.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Current streak</dt>
          <dd>
            {current} day{current === 1 ? '' : 's'}
          </dd>
        </div>
        <div>
          <dt>Longest streak</dt>
          <dd>
            {longest} day{longest === 1 ? '' : 's'}
          </dd>
        </div>
        <div>
          <dt>Public repositories</dt>
          <dd>{activity.publicRepos}</dd>
        </div>
      </dl>
    </section>
  );
}
