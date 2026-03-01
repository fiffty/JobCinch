import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useEffect, useMemo, useCallback } from 'react';
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

const preferenceLabels: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High',
};

function formatSalaryCell(value: number, job: Job, displayCurrency: string | null, convertSalary: (amount: number, from: string, to: string) => number): string {
  if (displayCurrency && displayCurrency !== job.currency) {
    const converted = convertSalary(value, job.currency, displayCurrency);
    return formatSalary(converted, displayCurrency);
  }
  return formatSalary(value, job.currency);
}

const columnHelper = createColumnHelper<Job>();

function ExchangeRateModal({
  targetCurrency,
  currencies,
  exchangeRates,
  onSave,
  onCancel,
}: {
  targetCurrency: string;
  currencies: string[];
  exchangeRates: Record<string, Record<string, number>>;
  onSave: (rates: Record<string, Record<string, number>>) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, Record<string, number>>>(() => {
    // Deep clone existing rates as starting point
    const clone: Record<string, Record<string, number>> = {};
    for (const from of Object.keys(exchangeRates)) {
      clone[from] = { ...exchangeRates[from] };
    }
    return clone;
  });

  // Only show pairs that convert *to* the target currency
  const pairs = useMemo(() => {
    return currencies
      .filter((c) => c !== targetCurrency)
      .map((c) => [c, targetCurrency] as [string, string]);
  }, [currencies, targetCurrency]);

  const allFilled = pairs.every(([from, to]) => {
    const rate = draft[from]?.[to];
    return rate !== undefined && rate > 0;
  });

  const updateDraft = (from: string, to: string, rate: number) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (!next[from]) next[from] = {};
      next[from] = { ...next[from], [to]: rate };
      // Auto-compute inverse
      if (!next[to]) next[to] = {};
      next[to] = { ...next[to], [from]: Math.round((1 / rate) * 10000) / 10000 };
      return next;
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Set Exchange Rates for {targetCurrency}</h3>
        <p className="modal-description">
          Enter exchange rates to convert salaries to {targetCurrency}.
        </p>
        <div className="exchange-rates-inputs">
          {pairs.map(([from, to]) => (
            <div key={`${from}-${to}`} className="exchange-rate-row">
              <label>
                1 {from} ={' '}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="rate"
                  value={draft[from]?.[to] ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      updateDraft(from, to, val);
                    }
                  }}
                />{' '}
                {to}
              </label>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
          <button
            className="modal-btn save"
            disabled={!allFilled}
            onClick={() => onSave(draft)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsIndex() {
  const jobs = useJobStore((state) => state.jobs);
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [modalTarget, setModalTarget] = useState<string | null>(null);

  const {
    currencies,
    setCurrencies,
    exchangeRates,
    setExchangeRate,
    displayCurrency,
    setDisplayCurrency,
    hasRatesForCurrency,
    convertSalary,
  } = useCurrencyStore();

  useEffect(() => {
    const unique = [...new Set(jobs.map((j) => j.currency))];
    setCurrencies(unique);
  }, [jobs, setCurrencies]);

  const handleCurrencyClick = useCallback(
    (currency: string | null) => {
      if (currency === null) {
        setDisplayCurrency(null);
        return;
      }
      if (hasRatesForCurrency(currency)) {
        setDisplayCurrency(currency);
      } else {
        setModalTarget(currency);
      }
    },
    [hasRatesForCurrency, setDisplayCurrency],
  );

  const handleModalSave = useCallback(
    (draft: Record<string, Record<string, number>>) => {
      // Persist all draft rates to the store
      for (const from of Object.keys(draft)) {
        for (const to of Object.keys(draft[from])) {
          setExchangeRate(from, to, draft[from][to]);
        }
      }
      if (modalTarget) {
        setDisplayCurrency(modalTarget);
      }
      setModalTarget(null);
    },
    [modalTarget, setExchangeRate, setDisplayCurrency],
  );

  const handleModalCancel = useCallback(() => {
    setModalTarget(null);
  }, []);

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
        cell: (info) => {
          const v = info.getValue();
          return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
        },
      }),
      columnHelper.accessor('visaSponsorship', {
        header: 'Visa Sponsor',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      }),
      columnHelper.accessor('city', { header: 'City' }),
      columnHelper.accessor('country', { header: 'Country' }),
      columnHelper.accessor('referrer', {
        header: 'Referrer',
        cell: (info) => info.getValue()?.name ?? '',
      }),
      columnHelper.accessor('preference', {
        header: 'Preference',
        cell: (info) => preferenceLabels[info.getValue()] ?? '',
        enableSorting: true,
      }),
      columnHelper.accessor((row) => getStatusLabel(row.status), {
        id: 'status',
        header: 'Status',
      }),
    ],
    [displayCurrency, convertSalary],
  );

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const uniqueValues = useMemo(() => {
    const collect = (fn: (j: Job) => string) => [...new Set(jobs.map(fn))].filter(Boolean).sort();
    return {
      city: collect((j) => j.city),
      remote: collect((j) => j.remote),
      country: collect((j) => j.country),
      status: collect((j) => getStatusLabel(j.status)),
    };
  }, [jobs]);

  return (
    <div className="app">
      <h1>Job Tracker</h1>

      {currencies.length > 1 && (
        <div className="currency-toggle">
          <span>Display currency:</span>
          <button
            className={displayCurrency === null ? 'active' : ''}
            onClick={() => handleCurrencyClick(null)}
          >
            Native
          </button>
          {currencies.map((c) => (
            <button
              key={c}
              className={displayCurrency === c ? 'active' : ''}
              onClick={() => handleCurrencyClick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {modalTarget && (
        <ExchangeRateModal
          targetCurrency={modalTarget}
          currencies={currencies}
          exchangeRates={exchangeRates}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
        />
      )}

      <div className="filters-row">
        {(['city', 'remote', 'country', 'status'] as const).map((key) => (
          <select
            key={key}
            value={(columnFilters.find((f) => f.id === key)?.value as string) ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setColumnFilters((prev) =>
                val
                  ? [...prev.filter((f) => f.id !== key), { id: key, value: val }]
                  : prev.filter((f) => f.id !== key),
              );
            }}
          >
            <option value="">All {key.charAt(0).toUpperCase() + key.slice(1)}</option>
            {uniqueValues[key].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ))}
      </div>

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
