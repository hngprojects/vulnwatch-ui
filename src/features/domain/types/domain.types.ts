export type VerificationMethod = "DNS_TXT" | "FILE_UPLOAD" | "EMAIL";
export type DomainStatus = "Verified" | "Pending" | "Failed" | "Revoked";

export interface Domain {
  id: string;
  domain: string;
  status: DomainStatus;
  createdAt: string;
  updatedAt: string | null;
  lastScannedAt: string | null;
  lastSecurityScore: number | null;
  verificationToken?: string;
  verificationMethod?: VerificationMethod;
  txtRecord?: string;
  instructions?: CreateDomainInstructions;
}

export interface CreateDomainPayload {
  domain: string;
}

export interface CreateDomainInstructions {
  txtRecord: string;
  value: string;
}

export interface CreateDomainResponse {
  id: string;
  domainName: string;
  verificationToken: string;
  status: DomainStatus;
  instructions: CreateDomainInstructions;
}

export interface DomainLinks {
  self: string;
  next: string | null;
  prev: string | null;
}

export interface DomainsListValue {
  data: Domain[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  links: DomainLinks;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: { code: string; message: string } | null;
}
