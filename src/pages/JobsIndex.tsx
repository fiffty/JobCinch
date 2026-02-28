import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useJobStore } from '../store/jobStore';
import { useCurrencyStore, formatSalary } from '../store/currencyStore';
import type { Job } from '../types/job';

function isPast(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00') <= new Date();
}

function getStatusLabel(status: Job['status']): string {
  if (status.receivedOfferAt && isPast(status.receivedOfferAt)) return 'Offer Received';
  if (status.receivedOfferAt && !isPast(status.receivedOfferAt)) return 'Offer Expected';

  const pastInterviews = status.interviewsAt.filter(isPast);
  const futureInterviews = status.interviewsAt.filter((d) => !isPast(d));
  if (futureInterviews.length > 0) return `Interview Scheduled (${futureInterviews.length})`;
  if (pastInterviews.length > 0) return `Interviewed (${pastInterviews.length})`;

  if (status.introCallAt && isPast(status.introCallAt)) return 'Intro Call Done';
  if (status.introCallAt && !isPast(status.introCallAt)) return 'Intro Call Scheduled';

  if (status.appliedAt && isPast(status.appliedAt)) return 'Applied';
  if (status.appliedAt && !isPast(status.appliedAt)) return 'Applying';

  return 'Not Applied';
}

function formatSalaryCell(value: number, job: Job, displayCurrency: string | null, convertSalary: (amount: number, from: string, to: string) => number): string {
  if (displayCurrency && displayCurrency !== job.currency) {
    const converted = convertSalary(value, job.currency, displayCurrency);
    return formatSalary(converted, displayCurrency);
  }
  return formatSalary(value, job.currency);
}

const columnHelper = createColumnHelper<Job>();

export default function JobsIndex() {
  const jobs = useJobStore((state) => state.jobs);
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    currencies,
    setCurrencies,
    exchangeRates,
    setExchangeRate,
    displayCurrency,
    setDisplayCurrency,
    allRatesAvailable,
    convertSalary,
  } = useCurrencyStore();

  useEffect(() => {
    const unique = [...new Set(jobs.map((j) => j.currency))];
    setCurrencies(unique);
  }, [jobs, setCurrencies]);

  const currencyPairs = useMemo(() => {
    const pairs: [string, string][] = [];
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        pairs.push([currencies[i], currencies[j]]);
      }
    }
    return pairs;
  }, [currencies]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('company', { header: 'Company' }),
      columnHelper.accessor('jobTitle', { header: 'Job Title' }),
      columnHelper.accessor('salaryMin', {
        header: 'Salary Min',
        cell: (info) => formatSalaryCell(info.getValue(), info.row.original, displayCurrency, convertSalary),
        enableSorting: true,
      }),
      columnHelper.accessor('salaryMax', {
        header: 'Salary Max',
        cell: (info) => formatSalaryCell(info.getValue(), info.row.original, displayCurrency, convertSalary),
        enableSorting: true,
      }),
      columnHelper.accessor('remote', {
        header: 'Remote',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      }),
      columnHelper.accessor('visaSponsorship', {
        header: 'Visa Sponsor',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      }),
      columnHelper.accessor('city', { header: 'City' }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: (info) => getStatusLabel(info.row.original.status),
      }),
    ],
    [displayCurrency, convertSalary],
  );

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const ratesAvailable = allRatesAvailable();

  return (
    <div className="app">
      <h1>Job Tracker</h1>

      {currencyPairs.length > 0 && (
        <div className="exchange-rates-section">
          <h3>Exchange Rates</h3>
          <div className="exchange-rates-inputs">
            {currencyPairs.map(([a, b]) => (
              <div key={`${a}-${b}`} className="exchange-rate-row">
                <label>
                  1 {a} ={' '}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="rate"
                    value={exchangeRates[a]?.[b] ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setExchangeRate(a, b, val);
                        setExchangeRate(b, a, Math.round((1 / val) * 10000) / 10000);
                      }
                    }}
                  />{' '}
                  {b}
                </label>
                <label>
                  1 {b} ={' '}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="rate"
                    value={exchangeRates[b]?.[a] ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        setExchangeRate(b, a, val);
                        setExchangeRate(a, b, Math.round((1 / val) * 10000) / 10000);
                      }
                    }}
                  />{' '}
                  {a}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {ratesAvailable && currencies.length > 1 && (
        <div className="currency-toggle">
          <span>Display currency:</span>
          <button
            className={displayCurrency === null ? 'active' : ''}
            onClick={() => setDisplayCurrency(null)}
          >
            Native
          </button>
          {currencies.map((c) => (
            <button
              key={c}
              className={displayCurrency === c ? 'active' : ''}
              onClick={() => setDisplayCurrency(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  className={header.column.getCanSort() ? 'sortable' : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => setLocation(`/job/${row.original.id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
