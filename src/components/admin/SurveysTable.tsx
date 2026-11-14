"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormField, SecondaryButton, SelectField, TextInput } from "@/components/ui/form-primitives";
import { SURVEY_GOV_TEACHER_QUESTION_LABEL, SURVEY_VOLUNTEER_QUESTION_LABEL } from "@/lib/survey/copy";
import { SurveysTableSkeleton, TableSkeletonRows } from "@/components/ui/skeleton";

type SortField =
  | "submittedAt"
  | "createdAt"
  | "referenceNumber"
  | "nameAsPerSsc"
  | "email"
  | "mobile";

type Lookup = { id: string; code?: string; label?: string; name?: string };

type DistrictLookup = Lookup & { state?: { name: string } | null };

type SurveyRow = {
  id: string;
  referenceNumber: string;
  nameAsPerSsc: string;
  email: string;
  mobile: string;
  submissionStatus: string;
  reviewStatus: string;
  submittedAt: string | null;
  createdAt: string;
  state?: { name: string } | null;
  district?: { name: string } | null;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
};

type SurveyFilters = {
  districtId: string;
  highestYogaQualificationLevelId: string;
  yogaProfessionalTypeId: string;
  employmentStatusId: string;
  govWorkInterestId: string;
  volunteerResponseId: string;
  languageId: string;
};

const EMPTY_SURVEY_FILTERS: SurveyFilters = {
  districtId: "",
  highestYogaQualificationLevelId: "",
  yogaProfessionalTypeId: "",
  employmentStatusId: "",
  govWorkInterestId: "",
  volunteerResponseId: "",
  languageId: "",
};

const REVIEW_STATUS_OPTIONS = ["", "NOT_STARTED", "APPROVED", "REJECTED"] as const;

const COLUMNS: { key: SortField; label: string; className?: string }[] = [
  { key: "referenceNumber", label: "Reference" },
  { key: "nameAsPerSsc", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "submittedAt", label: "Submitted" },
];

function labelOf(item: Lookup) {
  return item.label ?? item.name ?? item.code ?? item.id;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SurveysTable() {
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");
  const [surveyFilters, setSurveyFilters] = useState<SurveyFilters>(EMPTY_SURVEY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [districts, setDistricts] = useState<DistrictLookup[]>([]);
  const [yogaQualificationLevels, setYogaQualificationLevels] = useState<Lookup[]>([]);
  const [yogaProfessionalTypes, setYogaProfessionalTypes] = useState<Lookup[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<Lookup[]>([]);
  const [govWorkInterestOptions, setGovWorkInterestOptions] = useState<Lookup[]>([]);
  const [volunteerResponses, setVolunteerResponses] = useState<Lookup[]>([]);
  const [lectureLanguages, setLectureLanguages] = useState<Lookup[]>([]);
  const [masterLoading, setMasterLoading] = useState(true);

  useEffect(() => {
    async function loadMaster() {
      setMasterLoading(true);
      try {
        const [districtRes, masterRes] = await Promise.all([
          fetch("/api/master/districts"),
          fetch("/api/master"),
        ]);
        const districtData = await districtRes.json();
        const masterData = await masterRes.json();
        if (districtRes.ok) setDistricts(districtData.items ?? []);
        if (masterRes.ok) {
          setYogaQualificationLevels(masterData.yogaQualificationLevels ?? []);
          setYogaProfessionalTypes(masterData.yogaProfessionalTypes ?? []);
          setEmploymentStatuses(masterData.employmentStatuses ?? []);
          setGovWorkInterestOptions(masterData.govWorkInterestOptions ?? []);
          setVolunteerResponses(masterData.volunteerResponses ?? []);
          setLectureLanguages(masterData.lectureLanguages ?? []);
        }
      } finally {
        setMasterLoading(false);
      }
    }
    void loadMaster();
  }, []);

  const hasSurveyFilters = useMemo(
    () => Object.values(surveyFilters).some(Boolean),
    [surveyFilters],
  );

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortOrder,
    });
    if (appliedQ) params.set("q", appliedQ);
    if (reviewFilter) params.set("reviewStatus", reviewFilter);
    if (surveyFilters.districtId) params.set("districtId", surveyFilters.districtId);
    if (surveyFilters.highestYogaQualificationLevelId) {
      params.set("highestYogaQualificationLevelId", surveyFilters.highestYogaQualificationLevelId);
    }
    if (surveyFilters.yogaProfessionalTypeId) {
      params.set("yogaProfessionalTypeId", surveyFilters.yogaProfessionalTypeId);
    }
    if (surveyFilters.employmentStatusId) {
      params.set("employmentStatusId", surveyFilters.employmentStatusId);
    }
    if (surveyFilters.govWorkInterestId) {
      params.set("govWorkInterestId", surveyFilters.govWorkInterestId);
    }
    if (surveyFilters.volunteerResponseId) {
      params.set("volunteerResponseId", surveyFilters.volunteerResponseId);
    }
    if (surveyFilters.languageId) params.set("languageId", surveyFilters.languageId);

    try {
      const res = await fetch(`/api/admin/surveys?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setRows(data.items ?? []);
      setPagination(data.pagination ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, page, pageSize, reviewFilter, surveyFilters, sortBy, sortOrder]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  function applySearch() {
    setPage(1);
    setAppliedQ(searchInput.trim());
  }

  function updateSurveyFilter<K extends keyof SurveyFilters>(key: K, value: string) {
    setSurveyFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearSurveyFilters() {
    setSurveyFilters(EMPTY_SURVEY_FILTERS);
    setPage(1);
  }

  function toggleSort(field: SortField) {
    setPage(1);
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "submittedAt" || field === "createdAt" ? "desc" : "asc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortBy !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  }

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if ((masterLoading || loading) && rows.length === 0) {
    return <SurveysTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-[#1E2E24]/8 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <FormField label="Search reference, name, email, mobile">
            <div className="flex gap-2">
              <TextInput
                className="flex-1"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch();
                }}
                placeholder="Search…"
              />
              <SecondaryButton type="button" onClick={applySearch}>
                Search
              </SecondaryButton>
            </div>
          </FormField>
          <SelectField
            className="min-w-[180px]"
            label="Survey review status"
            placeholder="All"
            value={reviewFilter}
            onChange={(value) => {
              setReviewFilter(value);
              setPage(1);
            }}
          >
            {REVIEW_STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
          <SelectField
            className="min-w-[120px]"
            label="Per page"
            includeEmptyOption={false}
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="border-t border-[#1E2E24]/8 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
              Survey filters
            </p>
            {hasSurveyFilters ? (
              <SecondaryButton type="button" className="px-3 py-1.5 text-xs" onClick={clearSurveyFilters}>
                Clear survey filters
              </SecondaryButton>
            ) : null}
          </div>
          <div
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${masterLoading ? "opacity-60" : ""}`}
          >
            <SelectField
              label="District"
              placeholder="All"
              value={surveyFilters.districtId}
              onChange={(v) => updateSurveyFilter("districtId", v)}
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.state?.name ? ` (${d.state.name})` : ""}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Highest qualification related to Yoga"
              placeholder="All"
              value={surveyFilters.highestYogaQualificationLevelId}
              onChange={(v) => updateSurveyFilter("highestYogaQualificationLevelId", v)}
            >
              {yogaQualificationLevels.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Type of Yoga professional"
              placeholder="All"
              value={surveyFilters.yogaProfessionalTypeId}
              onChange={(v) => updateSurveyFilter("yogaProfessionalTypeId", v)}
            >
              {yogaProfessionalTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Current employment status"
              placeholder="All"
              value={surveyFilters.employmentStatusId}
              onChange={(v) => updateSurveyFilter("employmentStatusId", v)}
            >
              {employmentStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={SURVEY_GOV_TEACHER_QUESTION_LABEL}
              placeholder="All"
              value={surveyFilters.govWorkInterestId}
              onChange={(v) => updateSurveyFilter("govWorkInterestId", v)}
            >
              {govWorkInterestOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={SURVEY_VOLUNTEER_QUESTION_LABEL}
              placeholder="All"
              value={surveyFilters.volunteerResponseId}
              onChange={(v) => updateSurveyFilter("volunteerResponseId", v)}
            >
              {volunteerResponses.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Language of instruction"
              placeholder="All"
              value={surveyFilters.languageId}
              onChange={(v) => updateSurveyFilter("languageId", v)}
            >
              {lectureLanguages.map((item) => (
                <option key={item.id} value={item.id}>
                  {labelOf(item)}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#1E2E24]/8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1E2E24]/10 bg-[#FAF7F2] text-xs font-semibold uppercase tracking-wide text-[#5F7A66]">
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-[#1B3D32]"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.label}
                      <span className="text-[10px] opacity-70">{sortIndicator(col.key)}</span>
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E24]/6">
              {loading && rows.length === 0 ? (
                <TableSkeletonRows columns={COLUMNS.length + 1} rows={8} />
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-[#5F7A66]">
                    No survey responses found.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAF7F2]/80">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-[#1B3D32]">
                    {row.referenceNumber}
                  </td>
                  <td className="px-4 py-3 text-[#1E2E24]">{row.nameAsPerSsc}</td>
                  <td className="px-4 py-3 text-[#4A5F50]">{row.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.mobile}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#5F7A66]">
                    {formatDateTime(row.submittedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/surveys/${row.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-[#2F4F3A] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1B3D32]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#1E2E24]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#5F7A66]">
            {total === 0 ? "0 results" : `Showing ${from}–${to} of ${total}`}
            {loading ? " · Updating…" : ""}
          </p>
          <div className="flex items-center gap-2">
            <SecondaryButton
              type="button"
              className="px-3 py-1.5 text-xs"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </SecondaryButton>
            <span className="text-xs text-[#5F7A66]">
              Page {page} of {totalPages}
            </span>
            <SecondaryButton
              type="button"
              className="px-3 py-1.5 text-xs"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
