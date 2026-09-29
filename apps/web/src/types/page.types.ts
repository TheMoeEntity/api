/** Next.js 15+ passes these as Promises to server components. */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;
export type IdParams = Promise<{ id: string }>;

export interface SearchParamsProps {
  searchParams: SearchParams;
}

export interface IdPageProps {
  params: IdParams;
}
